import { Fragment, memo } from "react";
import { Dots, Line, Solid } from "../../anatomy/react/draw";

function Draw({ draw, lit }) {
  if (draw.type === "halo") return <path className="iso-halo" d={draw.d} />;
  if (draw.type === "solid")
    return (
      <Solid paths={draw.paths} tone={draw.tone} crease={draw.crease} flat={draw.flat} lit={draw.lit || lit} inner={draw.inner?.map((mark, index) => <Line key={index} d={mark.d} tone={mark.tone} />)} />
    );
  if (draw.type === "line") return <Line d={draw.d} tone={lit && draw.tone !== "faint" ? "lit" : draw.tone} free={draw.free} flow={draw.flow} dotted={draw.dotted} />;
  if (draw.type === "dots") return <Dots points={draw.points} size={draw.size} tone={draw.tone} />;
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

function Item({ item, focus }) {
  const lit = item.focus !== null && item.focus === focus;
  return (
    <g data-part={item.name}>
      {item.draw.map((draw, index) => (
        <Draw key={index} draw={draw} lit={lit} />
      ))}
    </g>
  );
}

export const SceneView = memo(function SceneView({ items, focus = null, transforms = {} }) {
  const runs = [];
  for (const item of items) {
    const last = runs.at(-1);
    if (last && last.group === item.group) last.items.push(item);
    else runs.push({ group: item.group, items: [item] });
  }

  return runs.map((run, index) => {
    const children = run.items.map((item) => <Item key={item.order} item={item} focus={focus} />);
    return run.group ? (
      <g key={index} data-group={run.group} transform={transforms[run.group]}>
        {children}
      </g>
    ) : (
      <Fragment key={index}>{children}</Fragment>
    );
  });
});
