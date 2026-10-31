// ─── Knowledge Graph ──────────────────────────────────────────────
// Structured facts that can be composed and reasoned over

export interface Fact {
  subject: string;
  predicate: string;
  object: string;
  category: string;
  tags: string[];
}

export interface Entity {
  name: string;
  type: string;
  aliases: string[];
  facts: Record<string, string>;
  description: string;
  category: string;
}

// ─── Entity Database ──────────────────────────────────────────────
export const ENTITIES: Entity[] = [
  // ── PLANETS ──
  { name: "Mercury", type: "planet", aliases: ["mercury"], category: "astronomy",
    description: "The smallest planet in our solar system and closest to the Sun",
    facts: { distance_from_sun: "57.9 million km", diameter: "4,879 km", moons: "0", orbital_period: "88 days", temperature: "-180°C to 430°C", type: "Terrestrial", atmosphere: "Very thin", mass: "3.3 × 10²³ kg" }},
  { name: "Venus", type: "planet", aliases: ["venus"], category: "astronomy",
    description: "The second planet from the Sun and the hottest in our solar system",
    facts: { distance_from_sun: "108.2 million km", diameter: "12,104 km", moons: "0", orbital_period: "225 days", temperature: "462°C average", type: "Terrestrial", atmosphere: "Dense CO₂", mass: "4.87 × 10²⁴ kg", rotation: "243 days (retrograde)" }},
  { name: "Earth", type: "planet", aliases: ["earth", "the earth", "our planet"], category: "astronomy",
    description: "The third planet from the Sun and the only known planet with life",
    facts: { distance_from_sun: "149.6 million km", diameter: "12,742 km", moons: "1", orbital_period: "365.25 days", temperature: "15°C average", type: "Terrestrial", atmosphere: "N₂ and O₂", mass: "5.97 × 10²⁴ kg", age: "4.54 billion years", surface_water: "71%" }},
  { name: "Mars", type: "planet", aliases: ["mars"], category: "astronomy",
    description: "The fourth planet from the Sun, known as the Red Planet",
    facts: { distance_from_sun: "227.9 million km", diameter: "6,779 km", moons: "2", orbital_period: "687 days", temperature: "-65°C average", type: "Terrestrial", atmosphere: "Thin CO₂", mass: "6.42 × 10²³ kg", nickname: "The Red Planet", highest_mountain: "Olympus Mons (21.9 km)" }},
  { name: "Jupiter", type: "planet", aliases: ["jupiter"], category: "astronomy",
    description: "The largest planet in our solar system, a gas giant",
    facts: { distance_from_sun: "778.5 million km", diameter: "139,820 km", moons: "95", orbital_period: "11.86 years", type: "Gas Giant", atmosphere: "H₂ and He", mass: "1.9 × 10²⁷ kg", great_red_spot: "Storm larger than Earth", day_length: "9.93 hours" }},
  { name: "Saturn", type: "planet", aliases: ["saturn"], category: "astronomy",
    description: "The sixth planet from the Sun, famous for its rings",
    facts: { distance_from_sun: "1.43 billion km", diameter: "116,460 km", moons: "146", orbital_period: "29.46 years", type: "Gas Giant", atmosphere: "H₂ and He", mass: "5.68 × 10²⁶ kg", rings: "Made of ice and rock", density: "Less than water" }},
  { name: "Uranus", type: "planet", aliases: ["uranus"], category: "astronomy",
    description: "The seventh planet, an ice giant that rotates on its side",
    facts: { distance_from_sun: "2.87 billion km", diameter: "50,724 km", moons: "27", orbital_period: "84 years", type: "Ice Giant", atmosphere: "H₂, He, and methane", mass: "8.68 × 10²⁵ kg", tilt: "98 degrees", temperature: "-224°C" }},
  { name: "Neptune", type: "planet", aliases: ["neptune"], category: "astronomy",
    description: "The eighth and farthest planet from the Sun",
    facts: { distance_from_sun: "4.5 billion km", diameter: "49,244 km", moons: "16", orbital_period: "165 years", type: "Ice Giant", atmosphere: "H₂, He, and methane", mass: "1.02 × 10²⁶ kg", wind_speed: "Up to 2,100 km/h", temperature: "-214°C" }},

  // ── SOLAR SYSTEM ──
  { name: "Sun", type: "star", aliases: ["sun", "the sun", "our star"], category: "astronomy",
    description: "The star at the center of our solar system",
    facts: { type: "G-type main-sequence star", diameter: "1.39 million km", temperature_surface: "5,500°C", temperature_core: "15 million °C", age: "4.6 billion years", composition: "73% hydrogen, 25% helium", distance_to_earth: "149.6 million km (1 AU)", mass: "1.989 × 10³⁰ kg", luminosity: "3.828 × 10²⁶ watts" }},
  { name: "Moon", type: "moon", aliases: ["moon", "the moon", "luna"], category: "astronomy",
    description: "Earth's only natural satellite",
    facts: { diameter: "3,474 km", distance_from_earth: "384,400 km", orbital_period: "27.3 days", gravity: "1/6 of Earth's", temperature_range: "-173°C to 127°C", age: "4.51 billion years", first_landing: "1969 (Apollo 11)" }},

  // ── GEOGRAPHY ──
  { name: "France", type: "country", aliases: ["france", "french"], category: "geography",
    description: "A country in Western Europe",
    facts: { capital: "Paris", population: "67.75 million", area: "640,679 km²", language: "French", currency: "Euro (€)", continent: "Europe", government: "Republic", president: "Emmanuel Macron", famous_for: "Eiffel Tower, Louvre, cuisine" }},
  { name: "United States", type: "country", aliases: ["usa", "united states", "america", "us"], category: "geography",
    description: "A country in North America",
    facts: { capital: "Washington, D.C.", population: "331.9 million", area: "9.83 million km²", language: "English", currency: "US Dollar ($)", continent: "North America", government: "Federal Republic", states: "50", president: "Joe Biden" }},
  { name: "Japan", type: "country", aliases: ["japan", "japanese"], category: "geography",
    description: "An island country in East Asia",
    facts: { capital: "Tokyo", population: "125.7 million", area: "377,975 km²", language: "Japanese", currency: "Yen (¥)", continent: "Asia", government: "Constitutional Monarchy", emperor: "Naruhito", famous_for: "Technology, anime, sushi" }},
  { name: "Brazil", type: "country", aliases: ["brazil", "brazilian"], category: "geography",
    description: "The largest country in South America",
    facts: { capital: "Brasília", population: "214.3 million", area: "8.51 million km²", language: "Portuguese", currency: "Real (R$)", continent: "South America", government: "Federal Republic", famous_for: "Amazon rainforest, Carnival" }},
  { name: "China", type: "country", aliases: ["china", "chinese"], category: "geography",
    description: "The most populous country in the world",
    facts: { capital: "Beijing", population: "1.41 billion", area: "9.6 million km²", language: "Mandarin Chinese", currency: "Yuan (¥)", continent: "Asia", government: "Single-party socialist republic", famous_for: "Great Wall, silk, tea" }},
  { name: "India", type: "country", aliases: ["india", "indian"], category: "geography",
    description: "The second most populous country",
    facts: { capital: "New Delhi", population: "1.41 billion", area: "3.29 million km²", language: "Hindi, English", currency: "Rupee (₹)", continent: "Asia", government: "Federal Republic", famous_for: "Taj Mahal, yoga, spices" }},
  { name: "Germany", type: "country", aliases: ["germany", "german"], category: "geography",
    description: "A country in Central Europe",
    facts: { capital: "Berlin", population: "83.2 million", area: "357,022 km²", language: "German", currency: "Euro (€)", continent: "Europe", government: "Federal Republic", famous_for: "Engineering, beer, automobiles" }},
  { name: "Australia", type: "country", aliases: ["australia", "aussie"], category: "geography",
    description: "A country and continent in the Southern Hemisphere",
    facts: { capital: "Canberra", population: "25.9 million", area: "7.69 million km²", language: "English", currency: "Australian Dollar (A$)", continent: "Oceania", government: "Federal Parliamentary Monarchy", famous_for: "Kangaroos, Great Barrier Reef" }},
  { name: "Egypt", type: "country", aliases: ["egypt", "egyptian"], category: "geography",
    description: "A country in North Africa known for ancient civilization",
    facts: { capital: "Cairo", population: "104.3 million", area: "1.01 million km²", language: "Arabic", currency: "Egyptian Pound", continent: "Africa", government: "Republic", famous_for: "Pyramids, Sphinx, Nile" }},
  { name: "Russia", type: "country", aliases: ["russia", "russian"], category: "geography",
    description: "The largest country in the world by area",
    facts: { capital: "Moscow", population: "144.1 million", area: "17.1 million km²", language: "Russian", currency: "Ruble (₽)", continent: "Europe/Asia", government: "Federal Republic", famous_for: "Largest country, trans-Siberian railway" }},

  // ── PHYSICS ──
  { name: "Gravity", type: "concept", aliases: ["gravity", "gravitational force"], category: "physics",
    description: "The force that attracts objects with mass toward each other",
    facts: { discovered_by: "Isaac Newton (described), Einstein (explained)", equation: "F = G(m₁m₂)/r²", speed: "Speed of light (gravitational waves)", on_earth: "9.81 m/s²", weakest_on: "Moon (1.62 m/s²)", strongest_planet: "Jupiter (24.79 m/s²)" }},
  { name: "Light", type: "concept", aliases: ["light", "speed of light", "photons"], category: "physics",
    description: "Electromagnetic radiation visible to the human eye",
    facts: { speed: "299,792,458 m/s", type: "Electromagnetic wave", wavelength_visible: "380-700 nm", particle: "Photon", dual_nature: "Wave-particle duality", from_sun_to_earth: "8 minutes 20 seconds" }},
  { name: "Electricity", type: "concept", aliases: ["electricity", "electric", "electric current"], category: "physics",
    description: "The flow of electrical charge",
    facts: { unit: "Ampere (current), Volt (potential), Ohm (resistance)", ohms_law: "V = IR", discovered_by: "Benjamin Franklin, Michael Faraday", type: "Flow of electrons", speed: "Near speed of light" }},

  // ── CHEMISTRY ──
  { name: "Water", type: "compound", aliases: ["water", "h2o"], category: "chemistry",
    description: "A chemical compound of hydrogen and oxygen",
    facts: { formula: "H₂O", boiling_point: "100°C", freezing_point: "0°C", density: "1 g/cm³ at 4°C", ph: "7 (neutral)", covers_earth: "71%", type: "Polar molecule", states: "Solid (ice), Liquid, Gas (steam)" }},
  { name: "Oxygen", type: "element", aliases: ["oxygen", "o2"], category: "chemistry",
    description: "A chemical element essential for life",
    facts: { symbol: "O", atomic_number: "8", atomic_mass: "15.999", type: "Nonmetal", in_atmosphere: "21%", discovered_by: "Carl Wilhelm Scheele (1772)", essential_for: "Cellular respiration, combustion" }},
  { name: "Carbon", type: "element", aliases: ["carbon"], category: "chemistry",
    description: "A chemical element fundamental to all known life",
    facts: { symbol: "C", atomic_number: "6", atomic_mass: "12.011", type: "Nonmetal", allotropes: "Diamond, Graphite, Fullerenes", forms: "Basis of organic chemistry", in_body: "18.5% by mass" }},
  { name: "Gold", type: "element", aliases: ["gold", "au"], category: "chemistry",
    description: "A precious metal element",
    facts: { symbol: "Au", atomic_number: "79", atomic_mass: "196.97", type: "Transition metal", melting_point: "1,064°C", density: "19.3 g/cm³", discovered: "Known since ancient times", uses: "Jewelry, electronics, currency" }},

  // ── BIOLOGY ──
  { name: "DNA", type: "molecule", aliases: ["dna", "deoxyribonucleic acid"], category: "biology",
    description: "The molecule that carries genetic instructions",
    facts: { structure: "Double helix", discovered_by: "Watson and Crick (1953)", components: "Adenine, Thymine, Guanine, Cytosine", base_pairs: "A-T, G-C", in_cells: "Nucleus (mostly)", length_in_cell: "About 2 meters if uncoiled", pairs_in_human: "3.2 billion" }},
  { name: "Cell", type: "structure", aliases: ["cell", "cells"], category: "biology",
    description: "The basic structural and functional unit of life",
    facts: { discovered_by: "Robert Hooke (1665)", types: "Prokaryotic and Eukaryotic", smallest: "Mycoplasma (0.2 μm)", largest: "Ostrich egg", parts: "Nucleus, mitochondria, ribosomes, membrane", in_human_body: "About 37.2 trillion" }},
  { name: "Photosynthesis", type: "process", aliases: ["photosynthesis"], category: "biology",
    description: "The process plants use to convert light energy to chemical energy",
    facts: { equation: "6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂", occurs_in: "Chloroplasts", pigment: "Chlorophyll", produces: "Glucose and oxygen", requires: "Sunlight, water, CO₂", discovered_by: "Jan Ingenhousz (1779)" }},

  // ── MATHEMATICS ──
  { name: "Pi", type: "constant", aliases: ["pi", "π"], category: "math",
    description: "The ratio of a circle's circumference to its diameter",
    facts: { value: "3.14159265358979...", type: "Irrational number", symbol: "π", uses: "Circle calculations, trigonometry", digits_computed: "Over 100 trillion", first_computed: "Archimedes (~250 BC)" }},
  { name: "Euler's Number", type: "constant", aliases: ["euler's number", "euler number", "e"], category: "math",
    description: "The base of natural logarithms",
    facts: { value: "2.71828182845904...", type: "Irrational and transcendental", symbol: "e", uses: "Exponential growth, compound interest", discovered_by: "Jacob Bernoulli" }},

  // ── TECHNOLOGY ──
  { name: "Internet", type: "technology", aliases: ["internet", "the internet", "web"], category: "technology",
    description: "A global network of interconnected computers",
    facts: { invented: "1969 (ARPANET)", protocol: "TCP/IP", www_invented: "1989 by Tim Berners-Lee", users: "5.3 billion (2023)", speed: "Speed of light in fiber optics", first_message: "\"LO\" (Oct 29, 1969)" }},
  { name: "Computer", type: "technology", aliases: ["computer", "computers"], category: "technology",
    description: "An electronic device that processes data",
    facts: { first_programmable: "Z3 by Konrad Zuse (1941)", components: "CPU, RAM, storage, I/O", binary: "Uses base-2 (0s and 1s)", first_electronic: "ENIAC (1945)", mores_law: "Transistors double every ~2 years" }},
  { name: "Artificial Intelligence", type: "technology", aliases: ["artificial intelligence", "ai", "machine learning"], category: "technology",
    description: "The simulation of human intelligence by machines",
    facts: { term_coined: "1956 by John McCarthy", types: "Narrow AI, General AI, Super AI", techniques: "Machine learning, deep learning, NLP", applications: "Voice assistants, self-driving cars, medical diagnosis", current_state: "Narrow AI (task-specific)" }},

  // ── HISTORY ──
  { name: "World War II", type: "event", aliases: ["world war 2", "ww2", "world war ii", "second world war"], category: "history",
    description: "A global war from 1939 to 1945",
    facts: { duration: "1939-1945", sides: "Allies vs Axis", casualties: "70-85 million", started: "Germany invaded Poland (Sept 1, 1939)", ended: "Japan surrendered (Sept 2, 1945)", major_events: "Holocaust, D-Day, atomic bombs" }},
  { name: "World War I", type: "event", aliases: ["world war 1", "ww1", "world war i", "first world war", "great war"], category: "history",
    description: "A global war from 1914 to 1918",
    facts: { duration: "1914-1918", sides: "Allies vs Central Powers", casualties: "17 million dead", started: "Assassination of Archduke Franz Ferdinand", ended: "Armistice (Nov 11, 1918)", triggered: "WWII" }},

  // ── ANIMALS ──
  { name: "Blue Whale", type: "animal", aliases: ["blue whale"], category: "animals",
    description: "The largest animal ever known to have lived on Earth",
    facts: { length: "Up to 30 meters", weight: "Up to 200 tons", heart_size: "Size of a small car", diet: "Krill (up to 4 tons/day)", lifespan: "80-90 years", speed: "Up to 50 km/h", endangered: "Yes" }},
  { name: "Elephant", type: "animal", aliases: ["elephant", "elephants"], category: "animals",
    description: "The largest living land animal",
    facts: { species: "African and Asian", weight: "Up to 6,000 kg (African)", height: "Up to 4 meters", lifespan: "60-70 years", intelligence: "Highly intelligent, self-aware", diet: "Herbivore", trunk_bones: "About 40,000 muscles in trunk" }},

  // ── HUMAN BODY ──
  { name: "Human Brain", type: "organ", aliases: ["brain", "human brain"], category: "biology",
    description: "The central organ of the nervous system",
    facts: { weight: "About 1.4 kg", neurons: "About 86 billion", synapses: "About 100 trillion", energy_use: "20% of body's energy", water_content: "73%", develops_until: "About age 25", fastest_signals: "Up to 120 m/s" }},
  { name: "Human Heart", type: "organ", aliases: ["heart", "human heart"], category: "biology",
    description: "The organ that pumps blood through the body",
    facts: { beats_per_day: "About 100,000", pumps_per_day: "About 7,570 liters", weight: "250-350 grams", size: "About the size of a fist", chambers: "4 (2 atria, 2 ventricles)", blood_vessels: "About 96,500 km total" }},

  // ── FOOD & DRINKS ──
  { name: "Coffee", type: "food", aliases: ["coffee"], category: "food",
    description: "A brewed drink made from roasted coffee beans",
    facts: { origin: "Ethiopia", caffeine_per_cup: "95 mg", consumed_daily: "2.25 billion cups worldwide", discovered: "Legend of Kaldi the goatherd (9th century)", types: "Arabica and Robusta", largest_producer: "Brazil" }},
  { name: "Chocolate", type: "food", aliases: ["chocolate"], category: "food",
    description: "A food made from cacao beans",
    facts: { origin: "Mesoamerica (Mayans/Aztecs)", main_ingredient: "Cacao beans", types: "Dark, Milk, White", melting_point: "34-38°C", largest_producer: "Ivory Coast and Ghana", chemicals: "Contains theobromine and phenylethylamine" }},

  // ── MUSIC ──
  { name: "Music", type: "art", aliases: ["music"], category: "arts",
    description: "An art form using sound as its medium",
    facts: { elements: "Melody, harmony, rhythm, timbre", oldest_instrument: "Bone flute (40,000+ years old)", genres: "Classical, Jazz, Rock, Pop, Hip-hop, Electronic, etc.", brain_effect: "Activates multiple brain regions simultaneously", fastest_genre: "Speedcore (1000+ BPM)" }},
];

// ─── Lookup Functions ─────────────────────────────────────────────

export function findEntity(query: string): Entity | null {
  const q = query.toLowerCase();
  
  // Direct name match
  for (const entity of ENTITIES) {
    if (q.includes(entity.name.toLowerCase())) return entity;
    for (const alias of entity.aliases) {
      if (q.includes(alias)) return entity;
    }
  }
  return null;
}

export function findEntityByAlias(alias: string): Entity | null {
  const a = alias.toLowerCase().trim();
  for (const entity of ENTITIES) {
    if (entity.name.toLowerCase() === a) return entity;
    for (const entityAlias of entity.aliases) {
      if (entityAlias === a) return entity;
    }
  }
  return null;
}

export function searchEntities(query: string): Entity[] {
  const q = query.toLowerCase();
  const words = q.split(/\s+/);
  
  return ENTITIES.filter(entity => {
    const searchable = [
      entity.name,
      entity.description,
      entity.category,
      ...entity.aliases,
      ...Object.values(entity.facts),
    ].join(' ').toLowerCase();
    
    return words.some(word => searchable.includes(word));
  });
}

export function getEntityFact(entity: Entity, factKey: string): string | null {
  return entity.facts[factKey] || null;
}

export function getAllCategories(): string[] {
  return [...new Set(ENTITIES.map(e => e.category))];
}
