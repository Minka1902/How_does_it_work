import { memo } from "react";
import { Dots, Line, Solid } from "../../anatomy/react/draw";

function Draw({ draw, lit }) {
  if (draw.type === "halo") return <path className="iso-halo" d={draw.d} />;
  if (draw.type === "solid")
    return (
      <Solid paths={draw.paths} tone={draw.tone} crease={draw.crease} flat={draw.flat} lit={draw.lit || lit} inner={draw.inner?.map((mark, index) => <Line key={index} d={mark.d} tone={mark.tone} />)} />
    );
  if (draw.type === "line") return <Line d={draw.d} tone={lit && draw.tone !== "faint" ? "lit" : draw.tone} free={draw.free} flow={draw.flow} dotted={draw.dotted} />;
  if (draw.type === "dots") return <Dots points={draw.points} size={draw.size} tone={draw.tone} />;
  if (draw.type === "cavity")
    return (
      <g className="hiiw-cavity">
        <path className="hiiw-cavity-fill" d={draw.front} />
        <path className="iso-line" data-tone="faint" d={draw.back} />
        <path className="iso-line" data-tone={lit ? "lit" : "lo"} d={draw.front} />
      </g>
    );
  if (draw.type === "faded")
    return draw.list.map(({ d, alpha }, index) => (
      <g key={index} opacity={alpha < 1 ? alpha.toFixed(2) : undefined}>
        <Line d={d} tone={draw.tone} />
      </g>
    ));
  const { piece } = draw;
  return (
    <g className="tb">
      <path className="tb-body" d={piece.body} />
      {piece.wide ? <path className="tb-shine" d={piece.shine} /> : null}
      {piece.wide ? <path className="tb-shade" d={piece.shade} /> : null}
      <path className="iso-line tb-edge" data-tone={lit ? "lit" : draw.tone} d={piece.edges} />
    </g>
  );
}

function Item({ item, focus, transform }) {
  const lit = item.focus !== null && item.focus === focus;
  const body = item.draw.map((draw, index) => <Draw key={index} draw={draw} lit={lit} />);
  return (
    <g data-item={item.order} data-part={item.name} data-focus={item.focus ?? undefined} data-piece={item.piece ?? undefined} data-key={item.key} data-lift={item.lift ? item.lift.toFixed(3) : undefined}>
      {item.group ? (
        <g data-group={item.group} transform={transform}>
          {body}
        </g>
      ) : (
        body
      )}
    </g>
  );
}

export const SceneView = memo(function SceneView({ items, focus = null, transforms = {} }) {
  return (
    <g data-scene="">
      {items.map((item) => (
        <Item key={item.order} item={item} focus={focus} transform={item.group ? transforms[item.group] : undefined} />
      ))}
    </g>
  );
});
