import { find, findByName, findByProps, findByStoreName } from "@vendetta/metro";
import { before } from "@vendetta/patcher";

import { semanticColors } from "@vendetta/ui";
import { showToast } from "@vendetta/ui/toasts";
const ThemeStore = findByStoreName("ThemeStore");
const { meta: { resolveSemanticColor } } = findByProps("colors", "meta");

const { default: { render: ActionSheet } } = (find(x => x.default?.render?.name == "ActionSheet") ?? { default: { render: false } });
const LazyActionSheet = findByProps("openLazy", "hideActionSheet");

const REG = /\bhttps?:\/\/(?:m|www|vm)\.tiktok\.com\/(?:.*\/)?(?:(?:v|embed|video|t)\/|\?shareId=|&item_id=)?(\d+|\w+)\b/gm;

// https://discord.com/channels/1015931589865246730/1062531774187573308/1117197626648039494
function renderActionSheet(component: any, props: { [key: string]: any }) {
  ActionSheet
    ? LazyActionSheet?.openLazy(new Promise(r => r({ default: component })), "ActionSheet", props)
    : showToast("You cannot open ActionSheets on this version! Upgrade to 163+");
};
const { BottomSheetScrollView } = findByProps("BottomSheetScrollView");

const WebView = findByName("WebView") || findByProps("WebView").default.render;
let wv = (link)=>{ 
    const bgcolor = resolveSemanticColor(ThemeStore.theme, semanticColors.MODAL_BACKGROUND);
    return (
        <WebView
          source={{ uri: link }}
          style={{ marginTop: 0, backgroundColor: bgcolor, height: 500, width: "100%" }}
        />
      );
};

function as({'0': link}) {
    return (
        <ActionSheet>
          <BottomSheetScrollView contentContainerStyle={{ marginBottom: 50 }}>
            {wv(link.replace(/^.*\/\/[^\/]+:?[0-9]?\//i , "https://tiktxk.wmeluna.workers.dev/"))}
          </BottomSheetScrollView>
        </ActionSheet>
        );
}

const handleClick = findByProps("handleClick");

export default function patch() {
  return before("handleClick", handleClick, function ([args]) {
      const { href } = args;
      const isTikTok = href.match(REG);
      if (!isTikTok) return;
      args.href = undefined;
      renderActionSheet(as, [href]);
  });
};
