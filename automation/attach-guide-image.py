#!/usr/bin/env python3
"""
가이드 아티클 발행 시 Unsplash에서 주제와 관련된 대표 이미지를 자동으로 가져와
public/guides/images/{slug}.webp 로 저장하고, 4개 언어 mdx의 frontmatter에
image / imageCredit / imageCreditUrl 필드를 삽입한다.

사용법: python3 attach-guide-image.py <repo_경로> <slug>

실패해도(네트워크 오류, API 키 없음, 검색 결과 없음 등) 예외로 죽지 않고
경고만 남긴 뒤 조용히 종료한다(exit 0) — 이미지 하나 때문에 하루치 발행
전체가 막혀서는 안 되기 때문. 이 경우 mdx는 기존처럼 이미지 없이 발행된다.
"""
import json
import os
import re
import sys
import urllib.parse
import urllib.request

LOCALES = ["en", "ja", "ko", "es"]


def load_env(env_path):
    env = {}
    if os.path.exists(env_path):
        with open(env_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


def extract_tags(en_mdx_path):
    text = open(en_mdx_path, encoding="utf-8").read()
    m = re.search(r"^tags:\s*\[(.*?)\]", text, re.MULTILINE)
    if not m:
        return []
    raw = m.group(1)
    return [t.strip().strip('"').strip("'") for t in raw.split(",") if t.strip()]


def update_image_alt(repo, image_path, photo):
    """content/guides/image-alt.json 의 해당 이미지 항목을 최신 사진 기준으로 갱신한다.

    - 같은 경로의 사진이 바뀌었을 수 있으므로 기존 항목(이전 사진 설명)은 먼저 지운다.
    - Unsplash가 주는 영어 설명(alt_description)이 있으면 en 항목으로만 저장한다.
      ko/ja/es는 번역이 필요하므로 비워 두며, 비어 있는 언어는 사이트에서 글 제목을
      대신 쓴다(기존 동작과 동일). 나중에 Claude가 사진을 보고 채울 수 있다.
    실패해도 발행을 막지 않는다.
    """
    try:
        alt_path = os.path.join(repo, "content", "guides", "image-alt.json")
        data = {}
        if os.path.exists(alt_path):
            with open(alt_path, encoding="utf-8") as f:
                data = json.load(f)
        data.pop(image_path, None)

        text = (photo.get("alt_description") or photo.get("description") or "").strip()
        text = re.sub(r"\s+", " ", text)
        if text:
            text = text[0].upper() + text[1:]
            if len(text) > 125:
                text = text[:125].rsplit(" ", 1)[0]
            data[image_path] = {"en": text}

        tmp = alt_path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        os.replace(tmp, alt_path)
    except Exception as e:
        sys.stderr.write(f"[attach-guide-image] 이미지 설명(alt) 갱신 실패(발행은 계속 진행): {e}\n")


def fetch_image(repo, slug, en_mdx_path):
    env = load_env(os.path.join(repo, "automation", ".env"))
    access_key = env.get("UNSPLASH_ACCESS_KEY") or os.environ.get("UNSPLASH_ACCESS_KEY")
    if not access_key:
        sys.stderr.write("[attach-guide-image] UNSPLASH_ACCESS_KEY 없음 - 이미지 없이 진행\n")
        return None

    tags = extract_tags(en_mdx_path)
    query = " ".join(tags[:2]) if tags else slug.replace("-", " ")

    search_url = "https://api.unsplash.com/search/photos?" + urllib.parse.urlencode({
        "query": query,
        "orientation": "landscape",
        "per_page": 1,
        "content_filter": "high",
    })
    req = urllib.request.Request(search_url, headers={"Authorization": f"Client-ID {access_key}"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.load(resp)

    results = data.get("results") or []
    if not results:
        sys.stderr.write(f"[attach-guide-image] 검색 결과 없음 (query='{query}') - 이미지 없이 진행\n")
        return None

    photo = results[0]
    raw_url = photo["urls"]["raw"]
    image_url = f"{raw_url}&w=1600&q=80&fm=webp&fit=crop"

    images_dir = os.path.join(repo, "public", "guides", "images")
    os.makedirs(images_dir, exist_ok=True)
    dest_path = os.path.join(images_dir, f"{slug}.webp")

    with urllib.request.urlopen(urllib.request.Request(image_url), timeout=30) as resp, open(dest_path, "wb") as f:
        f.write(resp.read())

    # Unsplash API 가이드라인: 실제 사용 시 download_location 호출 필수
    download_location = photo.get("links", {}).get("download_location")
    if download_location:
        try:
            dl_req = urllib.request.Request(download_location, headers={"Authorization": f"Client-ID {access_key}"})
            urllib.request.urlopen(dl_req, timeout=15)
        except Exception:
            pass

    photographer_name = photo.get("user", {}).get("name", "Unsplash")
    photographer_link = photo.get("user", {}).get("links", {}).get("html", "https://unsplash.com")
    utm = "utm_source=ExifLens&utm_medium=referral"
    sep = "&" if "?" in photographer_link else "?"
    photographer_link = f"{photographer_link}{sep}{utm}"

    update_image_alt(repo, f"/guides/images/{slug}.webp", photo)

    return {
        "image": f"/guides/images/{slug}.webp",
        "imageCredit": photographer_name,
        "imageCreditUrl": photographer_link,
    }


def inject_frontmatter(repo, slug, image_data):
    for lang in LOCALES:
        p_str = os.path.join(repo, "content", "guides", lang, f"{slug}.mdx")
        if not os.path.exists(p_str):
            continue
        text = open(p_str, encoding="utf-8").read()
        parts = text.split("---", 2)
        if len(parts) < 3:
            continue
        fm = parts[1]
        if "image:" in fm:
            continue  # 이미 처리된 경우 중복 삽입 방지
        addition = (
            f'image: "{image_data["image"]}"\n'
            f'imageCredit: "{image_data["imageCredit"]}"\n'
            f'imageCreditUrl: "{image_data["imageCreditUrl"]}"\n'
        )
        new_text = "---" + fm + addition + "---" + parts[2]
        with open(p_str, "w", encoding="utf-8") as f:
            f.write(new_text)


def main():
    if len(sys.argv) != 3:
        sys.stderr.write("사용법: attach-guide-image.py <repo> <slug>\n")
        return
    repo, slug = sys.argv[1], sys.argv[2]
    en_mdx_path = os.path.join(repo, "content", "guides", "en", f"{slug}.mdx")
    if not os.path.exists(en_mdx_path):
        sys.stderr.write(f"[attach-guide-image] 영문 mdx를 찾을 수 없음: {en_mdx_path}\n")
        return

    try:
        image_data = fetch_image(repo, slug, en_mdx_path)
    except Exception as e:
        sys.stderr.write(f"[attach-guide-image] 실패(발행은 계속 진행): {e}\n")
        image_data = None

    if image_data:
        inject_frontmatter(repo, slug, image_data)
        print(f"[attach-guide-image] 이미지 첨부 완료: {image_data['image']} (by {image_data['imageCredit']})")
    else:
        print("[attach-guide-image] 이미지 없이 진행")


if __name__ == "__main__":
    main()
