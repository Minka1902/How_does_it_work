export default {
  title: "How a refrigerator works",
  summary: "A fridge doesn't make cold. It pumps heat out of the box and dumps it into your kitchen, using a liquid that boils below freezing.",
  keywords: ["refrigerator", "fridge"],
  steps: [
    {
      id: "problem",
      heading: "Heat only flows downhill",
      body: [
        "Your kitchen is about 22 °C and the inside of the fridge is 4 °C. Heat always flows from warm to cold, so warmth leaks into the box through the walls and every time you open it.",
        "To stay cold, the fridge has to keep carrying that heat back out: uphill, from cold to warm. That takes work, and the work is done by the loop of pipes you see here.",
      ],
    },
    {
      id: "boiling",
      heading: "A liquid that boils below freezing",
      body: [
        "The pipes hold a refrigerant. Most home fridges use isobutane (R600a), which boils at −11.7 °C at normal air pressure. At the low pressure inside the cold pipes it boils even lower, around −20 °C.",
        "Boiling needs heat. Just as a pot of water takes heat from the stove to boil, the refrigerant takes heat from whatever is around it.",
      ],
      callout: "Evaporating sweat cools your skin for the same reason.",
    },
    {
      id: "evaporator",
      heading: "The evaporator soaks up heat",
      body: [
        "The zig-zag pipe on the back wall inside the box is the evaporator. The cold liquid boils as it flows through, taking heat from the air and the food around it.",
        "By the time it leaves, it has turned completely into a cool gas, carrying the box's heat away with it.",
      ],
    },
    {
      id: "compressor",
      heading: "The compressor squeezes the gas",
      body: [
        "The black dome is a sealed motor and pump. It pulls in the cool gas at about 0.7 bar and squeezes it to about 5 bar.",
        "Squeezing a gas heats it up. The heat taken from inside the box is now packed into a gas that is hotter than your kitchen, around 40 °C or more.",
      ],
    },
    {
      id: "condenser",
      heading: "The condenser dumps the heat",
      body: [
        "The hot gas flows through the grid of pipes and wires on the back. Because it is hotter than the room, its heat flows out into the air, downhill again.",
        "As it cools, the high-pressure gas condenses back into a liquid. That's why the back of a fridge feels warm.",
      ],
    },
    {
      id: "capillary",
      heading: "A thin tube drops the pressure",
      body: [
        "The warm liquid passes a small filter and then a very thin capillary tube, about as wide as a pin. Pushing liquid through it costs pressure, so it comes out the other end at low pressure.",
        "At low pressure the liquid can boil below freezing again. It flows back into the evaporator and the loop starts over.",
      ],
    },
    {
      id: "thermostat",
      heading: "The thermostat switches it on and off",
      body: [
        "The knob sets a target temperature. When the inside warms to about 1.5 °C above it, the thermostat starts the compressor; when it has cooled about 1.5 °C below, it stops it.",
        "Try it below: turn the knob, take the lid off and on, and watch how long the compressor runs. With the lid off, warm air pours in faster than the fridge can pump it out.",
      ],
      callout: "The figure runs 60 times faster than real time: one second here is one minute in a real fridge.",
    },
  ],
  figure: {
    fig: "Fig 1",
    title: "Chest fridge",
    hint: "Knob and lid below",
    label: "A chest fridge on a bench with its lid off: a compressor on rubber mounts, a condenser grid on a back panel, a capillary tube and an evaporator on the inner back wall, with a thermostat knob on the front.",
    readout: "Inside {inside} · set {set} · {compressor}",
    on: "compressor on",
    off: "compressor off",
    knob: "Thermostat",
    lid: "Lid on",
    keys: [
      { mark: "red", label: "Hot gas to the condenser" },
      { mark: "blue", label: "Cold refrigerant back to the compressor" },
      { mark: "lit", label: "The part this step is about" },
    ],
    caption: "Isobutane (R600a) boils at about −20 °C in the evaporator at 0.7 bar and condenses at about 40 °C at 5 bar. The model runs at 60× real time, with the thermostat switching ±1.5 °C around the set point.",
  },
};
