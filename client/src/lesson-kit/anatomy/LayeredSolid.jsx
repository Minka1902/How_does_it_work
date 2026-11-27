import { Solid } from "../../anatomy/react/draw";

export function LayeredSolid({ paths, inner, children, ...props }) {
  if (!paths.layers) return <Solid paths={paths} inner={inner} {...props}>{children}</Solid>;
  const last = paths.layers.length - 1;

  return paths.layers.map((layer, index) => (
    <Solid key={index} paths={layer} inner={index === last ? inner : undefined} {...props}>
      {index === last ? children : null}
    </Solid>
  ));
}
