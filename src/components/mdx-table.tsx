import type { ComponentProps } from "react";

/**
 * 가이드·블로그 본문(MDX)의 표를 가로 스크롤 가능한 영역으로 감싼다. 표가 화면보다
 * 넓어도(특히 모바일) 페이지 전체가 옆으로 밀리지 않고 표 안에서만 스크롤된다.
 * 좁은 표는 지금처럼 그대로 보인다.
 */
export function MdxTable(props: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  );
}
