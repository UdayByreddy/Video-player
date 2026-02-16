export function getVideoId(url: string): string {
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split("?")[0];
  if (url.includes("watch?v=")) return url.split("watch?v=")[1].split("&")[0];
  if (url.includes("/embed/")) return url.split("/embed/")[1].split("?")[0];
  return "";
}