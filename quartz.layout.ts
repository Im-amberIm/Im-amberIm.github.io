import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/Im-amberIm",
      Contact: "mailto:im-amberim@gmail.com",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({
      // Garden 폴더를 탐색기에서 제외
      filterFn: (node) => !node.slug.startsWith("My-Garden"),
      // 또는 특정 경로만 표시하도록 설정
      // folderDefaultState: "closed",
      // sortFn: ..., // 필요한 경우 정렬 방식도 설정 가능
    }),
  ],
  right: [
    Component.Graph({
      localGraph: {
        depth: 2,
        showTags: true,
        focusOnHover: true,
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
    Component.RecentNotes({
      limit: 5,
      showTags: true,
    }),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({
      // Garden 폴더를 탐색기에서 제외
      filterFn: (node) => !node.slug.startsWith("My-Garden"),
    }),
  ],
  right: [
    Component.Graph({
      localGraph: {
        depth: 1,
        showTags: true,
      },
    }),
  ],
}
