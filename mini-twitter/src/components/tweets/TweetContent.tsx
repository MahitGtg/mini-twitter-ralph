import Link from "next/link";

interface TweetContentProps {
  content: string;
  className?: string;
}

type ContentSegment =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "mention";
      value: string;
    };

const mentionRegex = /@([a-zA-Z0-9_]+)/g;

function parseContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  mentionRegex.lastIndex = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(content)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      segments.push({
        type: "text",
        value: content.slice(lastIndex, matchIndex),
      });
    }
    segments.push({
      type: "mention",
      value: match[1] ?? "",
    });
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: "text",
      value: content.slice(lastIndex),
    });
  }

  return segments.length ? segments : [{ type: "text", value: content }];
}

export default function TweetContent({ content, className }: TweetContentProps) {
  const segments = parseContent(content);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "mention") {
          const normalized = segment.value.toLowerCase();
          return (
            <Link
              key={`mention-${segment.value}-${index}`}
              href={`/profile/${normalized}`}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              className="font-medium text-sky-600 transition hover:text-sky-700 hover:underline"
            >
              @{segment.value}
            </Link>
          );
        }

        return (
          <span key={`text-${index}`}>
            {segment.value}
          </span>
        );
      })}
    </span>
  );
}
