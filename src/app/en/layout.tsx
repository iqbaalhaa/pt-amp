// English pages: root <html lang> stays "id", so mark this subtree as English.
export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div lang="en">{children}</div>;
}
