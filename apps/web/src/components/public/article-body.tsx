/** Render CMS HTML or plain text as readable article paragraphs. */
export function ArticleBody({ content }: { content: string }) {
  const trimmed = content.trim();
  if (!trimmed) return null;

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  if (looksLikeHtml) {
    return (
      <div
        className="prose-owuf space-y-4 text-base leading-relaxed text-slate-700 [&_a]:font-semibold [&_a]:text-ocean-700 [&_h2]:font-display [&_h2]:text-navy-950 [&_h3]:font-display [&_h3]:text-navy-950 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }

  return (
    <div className="prose-owuf space-y-4 text-base leading-relaxed text-slate-700">
      {trimmed.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
