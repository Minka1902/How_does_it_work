export default {
  title: "How a battery works",
  summary: "A lithium-ion cell stores energy by parking lithium in one electrode. Let it flow to the other side and the electrons it leaves behind light your lamp on their way around.",
  keywords: ["battery", "lithium", "li-ion", "18650", "cell"],
  steps: [
    {
      id: "stored",
      heading: "Energy stored as chemistry",
      body: [
        "This is an 18650 cell, the kind inside laptops, power tools and many electric cars: 18 mm wide and 65 mm long, holding about 3,000 mAh at 3.6 V, roughly 11 watt-hours.",
        "It doesn't hold electricity like a bucket holds water. It holds lithium in a place it would rather leave, and it only lets it leave if its electrons can take a path you provide.",
      ],
    },
    {
      id: "inside",
      heading: "Two electrodes and a wall",
      body: [
        "Inside the can is a long sandwich rolled up tight. The stand on the right shows a slice of it, magnified: graphite on copper foil (the negative side), a thin porous separator, and a metal oxide (NMC) on aluminium foil (the positive side).",
        "All of it is soaked in an electrolyte. Lithium ions can swim through it and through the separator, but electrons can't. That wall is the whole trick.",
      ],
    },
    {
      id: "ions",
      heading: "Lithium ions cross inside",
      body: [
        "When the lamp is connected, lithium tucked between the graphite layers gives up an electron and swims across the separator as a positive ion, into the oxide on the other side.",
        "The dots on the slice are those ions. Each one that crosses has left one electron behind in the graphite.",
      ],
    },
    {
      id: "electrons",
      heading: "Electrons take the long way",
      body: [
        "The electrons can't follow through the separator, so they go round the outside: out of the negative end, through the wires and the lamp's filament, and back in at the positive end to meet their ions.",
        "That flow through the outside circuit is the current. Turn it up and the cell empties faster.",
      ],
      callout: "A current of 1.5 A is about 9 billion billion electrons every second.",
    },
    {
      id: "charge",
      heading: "Charging pushes them back",
      body: [
        "A charger is a pump. It pushes electrons into the negative side and pulls them out of the positive side, which drags the lithium ions back across into the graphite.",
        "It pushes at a constant current until the cell reaches 4.2 V, then holds the voltage and lets the current fade, so the last few percent take the longest.",
      ],
    },
    {
      id: "voltage",
      heading: "Voltage tells you how full it is",
      body: [
        "A full cell rests at 4.2 V and an empty one at about 3.0 V. Most of the time it sits between 3.6 and 3.9 V, so a battery gauge reads the voltage and looks it up on a curve like the one in the model.",
        "Under load the voltage sags a little, because the cell has internal resistance (about 0.05 Ω here). Draw more current and the sag grows; that's why phones can shut off early in the cold.",
      ],
      callout: "The figure runs 600 times faster than real time: a 2-hour discharge takes 12 seconds.",
    },
  ],
  figure: {
    parts: {
      cell: { name: "18650 cell", body: "A steel can holding the rolled-up electrodes and electrolyte. 18 mm wide, 65 mm long.", step: "stored" },
      section: { name: "Electrode slice (magnified)", body: "Copper foil, graphite, separator, metal oxide, aluminium foil: the layers rolled up inside the can.", step: "inside" },
      switch: { name: "Slide switch", body: "Drag the knob: left charges, middle is off, right lights the lamp.", step: "electrons" },
      circuit: { name: "Wires", body: "The outside path the electrons must take, because they can't cross the separator.", step: "electrons" },
      lamp: { name: "Lamp", body: "Tap it to switch to the lamp. Its filament glows as current flows through it.", step: "electrons" },
      charger: { name: "Charger", body: "Tap it to charge. It pushes electrons back into the negative side.", step: "charge" },
    },
    fig: "Fig 2",
    title: "Li-ion cell",
    hint: "Tap a part · drag the switch",
    label: "An 18650 lithium-ion cell in a holder on a bench, wired through a slide switch to a lamp or a charger, with a magnified slice of its electrode layers on a stand.",
    readout: "{volts} V · {soc} % · {state}",
    states: { discharge: "lamp {amps} A", charge: "charging {amps} A", off: "open circuit", empty: "empty, cut off", full: "full" },
    mode: "Switch",
    modes: { charge: "Charge", off: "Off", discharge: "Lamp" },
    current: "Current",
    keys: [
      { mark: "lit", label: "Lithium ions in the electrode slice" },
      { mark: "dashed", label: "Electrons moving through the wires" },
      { mark: "raised", label: "Slice, top to bottom: aluminium, oxide, separator, graphite, copper" },
    ],
    caption: "3.0 Ah NMC cell, 0.05 Ω internal resistance, 4.2 V full and 3.0 V cut-off. Charging is constant current, then the current tapers near full. Twelve ions stand for the state of charge.",
  },
};
