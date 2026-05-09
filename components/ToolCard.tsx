type Tool = {
  title: string;
  description: string;
  emoji: string;
};

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="tool-card">
      <div className="tool-icon">{tool.emoji}</div>

      <h3>{tool.title}</h3>

      <p>{tool.description}</p>

      <button className="tool-btn">Open Tool</button>
    </div>
  );
}