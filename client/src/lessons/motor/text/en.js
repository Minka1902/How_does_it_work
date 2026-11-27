export default {
  title: "How an electric motor works",
  summary: "A coil of wire becomes a magnet when current flows through it. Put it between two magnets, flip its current at just the right moments, and it keeps chasing them round and round.",
  keywords: ["motor", "dc motor", "electric motor"],
  steps: [
    {
      id: "magnets",
      heading: "Two magnets make a field",
      body: [
        "This is a small brushed DC motor taken apart on a bench, the kind inside toys, toothbrushes and car windows. On each side sits a curved permanent magnet: north on one side, south on the other.",
        "Between them is a steady magnetic field. With no current, nothing happens: the rotor in the middle is just iron and copper.",
      ],
    },
    {
      id: "coil",
      heading: "A coil becomes a magnet",
      body: [
        "The rotor, or armature, has three iron arms, each wrapped in a coil of copper wire. When current flows through a coil, that arm becomes an electromagnet with its own north and south.",
        "Its poles are pulled toward the opposite poles of the fixed magnets and pushed from the same ones, so the rotor turns. The coil with the most current is lit.",
      ],
    },
    {
      id: "commutator",
      heading: "The commutator flips the current",
      body: [
        "If the current stayed the same, the arm would swing to the magnet and stop there. The ring of copper segments on the shaft, the commutator, fixes that.",
        "It turns with the rotor, and every third of a turn it hands the current to the next coil, so there's always an arm being pulled ahead. Watch the lit coil change as the segments pass the brushes.",
      ],
    },
    {
      id: "brushes",
      heading: "Brushes slide on the segments",
      body: [
        "Two carbon blocks, the brushes, are pressed against the spinning commutator by springs. They carry current from the battery into whichever segments they touch.",
        "Carbon is soft and slippery, so it wears instead of the copper. Worn brushes are why old drills spark and eventually stop.",
      ],
    },
    {
      id: "speed",
      heading: "Why it doesn't speed up forever",
      body: [
        "A spinning coil in a magnetic field also makes a voltage of its own, pushing back against the battery. The faster it spins, the bigger this back-EMF and the less current gets through.",
        "Without load this motor settles near 6,000 rpm at 12 V. Add load with the brake and it slows, back-EMF drops, and more current flows to make more torque. Held still, it draws its full 6 A.",
      ],
      callout: "The rotor is drawn turning 100 times slower than the readout says.",
    },
    {
      id: "generator",
      heading: "Reverse it, or turn it by hand",
      body: [
        "Flip the battery (tap it, or slide the voltage below zero) and the current in every coil reverses, so the motor runs backwards.",
        "Set the voltage to 0 and drag the rotor round yourself. Now the motor works backwards in a different way: it's a generator, and the readout shows the voltage your hand is making.",
      ],
    },
  ],
  figure: {
    fig: "Fig 5",
    title: "Brushed DC motor",
    hint: "Drag the rotor · tap the battery",
    label: "A small brushed DC motor opened on a bench: two curved magnets, a three-pole armature with copper coils on a shaft, a commutator, two carbon brushes and a battery.",
    readout: "{volts} V · {rpm} rpm · {amps} A · {torque} mN·m",
    generating: "turning by hand · {rpm} rpm · generating {emf} V",
    volts: "Voltage",
    load: "Brake",
    parts: {
      magnets: { name: "Permanent magnets", body: "Curved magnets, north and south, that make a steady field across the rotor.", step: "magnets" },
      rotor: { name: "Armature (rotor)", body: "Three iron arms wrapped in copper coils. Drag it to turn it by hand.", step: "coil" },
      commutator: { name: "Commutator", body: "Three copper segments on the shaft that pass the current from coil to coil as it turns.", step: "commutator" },
      brushes: { name: "Carbon brushes", body: "Spring-loaded blocks that slide on the commutator and feed it current.", step: "brushes" },
      battery: { name: "Battery", body: "Tap it to flip its polarity and run the motor the other way.", step: "speed" },
    },
    keys: [
      { mark: "lit", label: "Coil carrying full current" },
      { mark: "dashed", label: "Current in the wires" },
      { mark: "raised", label: "Iron armature on the shaft" },
    ],
    caption: "Model: back-EMF constant 0.019 V·s/rad, winding resistance 2 Ω, so about 6,000 rpm with no load at 12 V and 6 A when stalled. Rotation drawn 100× slower than real.",
  },
};
