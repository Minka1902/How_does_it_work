export default {
  title: "How a pin-tumbler lock works",
  summary: "Five tiny stacks of pins stand across a line inside the lock. Only a key with the right cuts lifts every gap onto that line at once, and only then can the plug turn.",
  keywords: ["lock", "key", "door lock"],
  steps: [
    {
      id: "puzzle",
      heading: "A puzzle only one key solves",
      body: [
        "Most front doors use a pin-tumbler lock, an idea that goes back thousands of years and was perfected in the 1860s. This one is cut in half so you can see inside.",
        "The key doesn't push anything open. It solves a small puzzle, and the lock only lets you turn it once the puzzle is solved.",
      ],
    },
    {
      id: "plug",
      heading: "The plug has to turn",
      body: [
        "Inside the housing sits a cylinder called the plug. The key goes into its slot, the keyway. Turning the plug turns the cam at the back, and the cam moves the bolt that holds the door shut.",
        "So locking is simple: stop the plug from turning.",
      ],
    },
    {
      id: "pins",
      heading: "Pin stacks block the shear line",
      body: [
        "Five holes are drilled straight through the housing and into the plug. Each holds a stack: a key pin at the bottom, a driver pin on top, and a spring pushing them down.",
        "The dashed line is the shear line, the gap between the plug and the housing. With no key, the driver pins drop across it and lock the plug to the housing.",
      ],
    },
    {
      id: "key",
      heading: "The key lifts each stack",
      body: [
        "Each key pin is a different length. The cuts on the key are a matching pattern of heights, so as the key slides in, the pins ride up and down over its cuts.",
        "Drag the key in and out and watch every stack bob over the teeth.",
      ],
    },
    {
      id: "shear",
      heading: "Every gap on the line at once",
      body: [
        "With the right key all the way in, every key pin's top lands exactly on the shear line. The gap between each key pin and its driver pin lines up with the gap between plug and housing.",
        "Nothing crosses the line any more, so the plug turns and the cam throws the bolt.",
      ],
      callout: "Real cut depths differ by only 0.38 mm. That small step is the whole difference between your key and your neighbour's.",
    },
    {
      id: "wrong",
      heading: "A wrong key binds",
      body: [
        "A wrong key lifts some stacks too high and some too low. Any pin that still crosses the shear line, a driver pushed down into the plug or a key pin pushed up into the housing, jams the plug.",
        "The pins that block it flash red. Try switching keys, or tap a cut on the key to file it one step deeper.",
      ],
    },
    {
      id: "combinations",
      heading: "Why there are so many different keys",
      body: [
        "This lock has 5 pins and each cut can be one of 10 depths, so there are 10 × 10 × 10 × 10 × 10 = 100,000 possible keys. Manufacturers skip some that are too steep to cut, but tens of thousands remain.",
        "Make your own key with the cut buttons and see how close you can get without matching all five.",
      ],
    },
  ],
  figure: {
    fig: "Fig 4",
    title: "Pin-tumbler lock",
    hint: "Drag the key · tap a cut to file it",
    label: "A pin-tumbler cylinder lock cut in half on a stand: housing, plug with keyway, five pin stacks with springs, a key that slides in, and a cam at the back.",
    readout: "{aligned}/5 at shear line · key {inserted}% in · {state}",
    states: { locked: "locked", turns: "ready to turn", binds: "binds", open: "turned" },
    key: "Key",
    keyNames: { correct: "Right", wrong: "Wrong", custom: "Your key" },
    inserted: "Key in",
    turn: "Turn",
    turnBack: "Turn back",
    parts: {
      housing: { name: "Housing", body: "The fixed body of the lock, with five pin chambers drilled into its upper part.", step: "puzzle" },
      plug: { name: "Plug", body: "The cylinder that turns. Tap it to try turning the key.", step: "plug" },
      pins: { name: "Pin stacks", body: "Key pin, driver pin and spring. The gap between the two pins must sit on the shear line.", step: "pins" },
      key: { name: "Key", body: "Drag it in and out. Tap a cut to file it one step deeper and make your own key.", step: "key" },
      cam: { name: "Cam", body: "Turns with the plug and moves the bolt. Tap it to try turning.", step: "shear" },
    },
    keys: [
      { mark: "dashed", label: "Shear line (lit when every gap sits on it)" },
      { mark: "red", label: "Pins that block the turn" },
      { mark: "lit", label: "The part this step is about" },
    ],
    caption: "Five pins at 3.96 mm spacing, cut depths 0.38 mm apart, 10 depths per cut: 100,000 combinations. Cut in half so the pins show; shown about 2× size.",
  },
};
