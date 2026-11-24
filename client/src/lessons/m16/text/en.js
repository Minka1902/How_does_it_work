export default {
  title: "How an M16 works",
  summary: "Every shot powers the next one. A little of the gas that pushes the bullet is piped back to unlock the bolt, throw out the empty case and load a fresh round, all in about 70 milliseconds.",
  keywords: ["m16", "rifle", "gas system", "cycle of operation"],
  steps: [
    {
      id: "fire",
      heading: "Fire",
      body: [
        "The rifle fires a 5.56×45 mm cartridge. When the primer is struck, the powder burns in a few milliseconds and the hot gas pushes the bullet down the barrel.",
        "While that happens, the bolt is locked to the barrel, so the case is held in the chamber and the pressure can't escape backwards.",
      ],
      callout: "This lesson shows the mechanism of the cycle only, the way a museum cutaway does. It doesn't cover assembly, modification or the trigger parts.",
    },
    {
      id: "gas",
      heading: "Gas is piped back",
      body: [
        "Near the front of the barrel there's a small hole under the gas block. Once the bullet passes it, some of the gas behind the bullet escapes up into the thin gas tube and flows all the way back.",
        "The M16 uses direct impingement: the gas goes straight into the bolt carrier through the gas key on top of it, and pushes the carrier backwards.",
      ],
    },
    {
      id: "unlock",
      heading: "The bolt turns and unlocks",
      body: [
        "The carrier moves back a few millimetres on its own first. That short delay lets the pressure in the barrel drop after the bullet has left.",
        "Then a cam pin through the bolt rides in a curved slot in the carrier. As the carrier keeps moving, the slot turns the bolt 22.5°, which frees its lugs from the barrel. The cam pin on the side of the carrier shows the turn.",
      ],
    },
    {
      id: "extract",
      heading: "The empty case is pulled out",
      body: [
        "Now the bolt travels back with the carrier. A small claw on the bolt face, the extractor, holds the rim of the empty case and pulls it out of the chamber.",
      ],
    },
    {
      id: "eject",
      heading: "…and thrown clear",
      body: [
        "A spring-loaded plunger in the bolt face, the ejector, pushes on the other side of the rim. Once the case is clear of the chamber it tips out through the ejection port on the right side of the rifle.",
      ],
    },
    {
      id: "cock",
      heading: "The buffer stops it and the action is reset",
      body: [
        "The carrier pushes the buffer back into the buffer tube behind the receiver, compressing the long action spring. The buffer's weight and the spring soak up the energy so the carrier stops smoothly.",
        "On the way back, the carrier also rides over the hammer and pushes it down, so the rifle is ready for the next shot. (The trigger parts aren't shown.)",
      ],
    },
    {
      id: "feed",
      heading: "A new round is fed",
      body: [
        "The compressed spring drives everything forward again. The bottom of the bolt catches the rim of the top round in the magazine and pushes it forward, up the feed ramp and into the chamber.",
        "The magazine spring lifts the next round into place, ready for the following cycle.",
      ],
    },
    {
      id: "lock",
      heading: "The bolt turns and locks again",
      body: [
        "When the bolt reaches the barrel, it stops, but the carrier keeps going. The cam slot turns the bolt back 22.5° so its lugs lock behind the barrel's lugs.",
        "The rifle is back where it started, with a new round in the chamber. At 700–950 rounds a minute, the whole cycle takes about 63–86 ms.",
      ],
      callout: "The figure plays one cycle in 4 seconds, about 57 times slower than real.",
    },
  ],
  figure: {
    fig: "Fig 3",
    title: "Gas-operated action",
    hint: "Play, or drag the cycle below",
    label: "A cutaway display of an M16 action on a stand: barrel with gas block and gas tube, bolt carrier with gas key, rotating bolt and cam pin, buffer and action spring, and a magazine.",
    readout: "{phase} · carrier {mm} mm · bolt {deg}° · {ms} ms",
    phases: { fire: "Fire", gas: "Gas", unlock: "Unlock", extract: "Extract", eject: "Eject", cock: "Buffer stop", feed: "Feed", lock: "Lock", ready: "Ready" },
    cycle: "Cycle",
    keys: [
      { mark: "red", label: "Gas flowing back through the gas tube" },
      { mark: "lit", label: "The part this step is about" },
      { mark: "raised", label: "Near half of the receiver cut away" },
    ],
    caption: "Direct-impingement gas operation with a rotating bolt (22.5° turn), shown at about 0.6 scale. Carrier travel about 89 mm. One cycle takes about 70 ms in a real rifle; here it plays in 4 s.",
  },
};
