export default {
  title: "How bicycle gears work",
  summary: "A toothed ring at the pedals, a chain and a stack of cogs at the back wheel. Swap the cog and the same turn of your legs sends the bike a shorter or longer way.",
  keywords: ["bike gears", "bicycle", "derailleur", "gear ratio"],
  steps: [
    {
      id: "drive",
      heading: "Your legs turn a toothed ring",
      body: [
        "This is a bike's drivetrain on a work stand. Your foot pushes the pedal round on its crank, and the crank turns the chainring, a 42-tooth sprocket bolted to it.",
        "The chain wraps around the chainring's teeth and carries that motion back to a cog on the rear hub, which turns the wheel.",
      ],
      callout: "The drawing turns 4 times slower than the readout says.",
    },
    {
      id: "ratio",
      heading: "Count the teeth",
      body: [
        "Each tooth pulls the chain exactly one link, 12.7 mm (half an inch). One turn of the pedals pulls 42 links past the chainring.",
        "On a 17-tooth cog those 42 links turn the wheel 42 ÷ 17 = 2.47 times. That number is the gear ratio. With a wheel 2.1 m round, one pedal turn moves the bike about 5.2 m.",
      ],
    },
    {
      id: "small",
      heading: "Small cog: far, but hard",
      body: [
        "Shift to the 11-tooth cog and the ratio jumps to 3.82: each pedal turn sends the bike 8 m.",
        "The catch is force. The same push on the pedal now has to turn the wheel almost four times, so every stroke feels heavy. It's the gear for flat roads and descents, when you're already going fast.",
      ],
    },
    {
      id: "big",
      heading: "Big cog: short, but easy",
      body: [
        "On the 28-tooth cog the ratio is 1.5, so a pedal turn moves the bike just 3.15 m.",
        "You pedal more often for the same distance, but each push needs far less force. That's why riders shift onto the big cogs for a steep climb.",
      ],
    },
    {
      id: "derailleur",
      heading: "The derailleur moves the chain",
      body: [
        "To change gear, a cable swings the rear derailleur sideways. Its upper pulley steers the moving chain until it climbs onto the next cog. Drag the derailleur to try it.",
        "Bigger cogs need more chain. The cage at the bottom is on a spring: it swings forward to let chain out for the big cogs and back to take up the slack on the small ones, so the 92-link chain always stays tight.",
      ],
    },
    {
      id: "cadence",
      heading: "Same legs, any speed",
      body: [
        "Cadence is how many times a minute you turn the pedals. Most riders are most efficient somewhere between 70 and 90 rpm.",
        "Speed = cadence × ratio × wheel size. At 80 rpm that's about 15 km/h on the 28, 25 km/h on the 17 and 38 km/h on the 11. Gears let your legs keep the same comfortable pace while the bike goes slow or fast.",
      ],
    },
  ],
  figure: {
    fig: "Fig 6",
    title: "Bicycle drivetrain",
    hint: "Drag the crank · tap a cog · drag the derailleur",
    label: "A bicycle drivetrain on a work stand: a 42-tooth chainring with its crank and pedal, a chain, a seven-cog cassette from 11 to 28 teeth, and a rear derailleur with two pulleys.",
    readout: "{ring}×{cog} · ratio {ratio} · {speed} km/h at {cadence} rpm",
    gear: "Cog",
    cadence: "Cadence",
    cadenceUnit: "rpm",
    parts: {
      crank: { name: "Crank and pedal", body: "The lever your foot pushes round. Drag it to pedal by hand.", step: "drive" },
      ring: { name: "Chainring", body: "42 teeth, each one pulling the chain along one link.", step: "ratio" },
      chain: { name: "Chain", body: "92 links, 12.7 mm apart: rollers held between inner and outer plates.", step: "ratio" },
      cassette: { name: "Cassette", body: "Seven cogs from 11 to 28 teeth. Tap one to shift onto it.", step: "small" },
      derailleur: { name: "Rear derailleur", body: "Pushes the chain across the cogs while its spring cage keeps it tight. Drag it sideways.", step: "derailleur" },
    },
    keys: [{ mark: "lit", label: "The part this step is about" }],
    caption: "42-tooth chainring, 11–28 seven-speed cassette, 12.7 mm chain pitch, 2.1 m wheel. The cage angle is solved so the chain length never changes. Motion drawn 4× slower than real; gap between cogs exaggerated.",
  },
};
