import { BagDrawer } from "@/components/bag/BagDrawer";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SmoothScroll />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <BagDrawer />
    </>
  );
}
