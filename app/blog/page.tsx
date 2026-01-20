import { redirect } from "next/navigation";
import siteData from "@/data/site.json";

export default function BlogPage() {
  redirect(siteData.blog.url);
}
