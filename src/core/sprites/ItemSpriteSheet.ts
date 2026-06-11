// SPDX-License-Identifier: GPL-3.0
// Port of com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet

const TX_WIDTH = 256;
const SIZE = 16;
const WIDTH = TX_WIDTH / SIZE;

function xy(x: number, y: number): number {
  x -= 1; y -= 1;
  return x + WIDTH * y;
}

export class ItemSpriteSheet {
  static readonly SIZE = SIZE;

  // Placeholders (18 slots) – xy(1,1) = 0
  private static readonly PLACEHOLDERS = xy(1, 1);
  static readonly SOMETHING = ItemSpriteSheet.PLACEHOLDERS + 0;
  static readonly WEAPON_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 1;
  static readonly ARMOR_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 2;
  static readonly MISSILE_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 3;
  static readonly WAND_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 4;
  static readonly RING_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 5;
  static readonly ARTIFACT_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 6;
  static readonly TRINKET_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 7;
  static readonly FOOD_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 8;
  static readonly BOMB_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 9;
  static readonly POTION_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 10;
  static readonly SEED_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 11;
  static readonly SCROLL_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 12;
  static readonly STONE_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 13;
  static readonly ELIXIR_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 14;
  static readonly SPELL_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 15;
  static readonly MOB_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 16;
  static readonly DOCUMENT_HOLDER = ItemSpriteSheet.PLACEHOLDERS + 17;

  // Uncollectible (14 slots) – xy(3,2) = 18
  private static readonly UNCOLLECTIBLE = xy(3, 2);
  static readonly GOLD = ItemSpriteSheet.UNCOLLECTIBLE + 0;
  static readonly ENERGY = ItemSpriteSheet.UNCOLLECTIBLE + 1;
  static readonly DEWDROP = ItemSpriteSheet.UNCOLLECTIBLE + 3;
  static readonly PETAL = ItemSpriteSheet.UNCOLLECTIBLE + 4;
  static readonly SANDBAG = ItemSpriteSheet.UNCOLLECTIBLE + 5;
  static readonly SPIRIT_ARROW = ItemSpriteSheet.UNCOLLECTIBLE + 6;
  static readonly TENGU_BOMB = ItemSpriteSheet.UNCOLLECTIBLE + 8;
  static readonly TENGU_SHOCKER = ItemSpriteSheet.UNCOLLECTIBLE + 9;
  static readonly GEO_BOULDER = ItemSpriteSheet.UNCOLLECTIBLE + 10;

  // Containers (16 slots) – xy(1,3) = 32
  private static readonly CONTAINERS = xy(1, 3);
  static readonly BONES = ItemSpriteSheet.CONTAINERS + 0;
  static readonly REMAINS = ItemSpriteSheet.CONTAINERS + 1;
  static readonly TOMB = ItemSpriteSheet.CONTAINERS + 2;
  static readonly GRAVE = ItemSpriteSheet.CONTAINERS + 3;
  static readonly CHEST = ItemSpriteSheet.CONTAINERS + 4;
  static readonly LOCKED_CHEST = ItemSpriteSheet.CONTAINERS + 5;
  static readonly CRYSTAL_CHEST = ItemSpriteSheet.CONTAINERS + 6;
  static readonly EBONY_CHEST = ItemSpriteSheet.CONTAINERS + 7;

  // Misc consumable (32 slots) – xy(1,4) = 48
  private static readonly MISC_CONSUMABLE = xy(1, 4);
  static readonly ANKH = ItemSpriteSheet.MISC_CONSUMABLE + 0;
  static readonly STYLUS = ItemSpriteSheet.MISC_CONSUMABLE + 1;
  static readonly SEAL = ItemSpriteSheet.MISC_CONSUMABLE + 2;
  static readonly TORCH = ItemSpriteSheet.MISC_CONSUMABLE + 3;
  static readonly BEACON = ItemSpriteSheet.MISC_CONSUMABLE + 4;
  static readonly HONEYPOT = ItemSpriteSheet.MISC_CONSUMABLE + 5;
  static readonly SHATTPOT = ItemSpriteSheet.MISC_CONSUMABLE + 6;
  static readonly IRON_KEY = ItemSpriteSheet.MISC_CONSUMABLE + 7;
  static readonly GOLDEN_KEY = ItemSpriteSheet.MISC_CONSUMABLE + 8;
  static readonly CRYSTAL_KEY = ItemSpriteSheet.MISC_CONSUMABLE + 9;
  static readonly WORN_KEY = ItemSpriteSheet.MISC_CONSUMABLE + 10;
  static readonly MASK = ItemSpriteSheet.MISC_CONSUMABLE + 11;
  static readonly CROWN = ItemSpriteSheet.MISC_CONSUMABLE + 12;
  static readonly AMULET = ItemSpriteSheet.MISC_CONSUMABLE + 13;
  static readonly MASTERY = ItemSpriteSheet.MISC_CONSUMABLE + 14;
  static readonly KIT = ItemSpriteSheet.MISC_CONSUMABLE + 15;
  static readonly SEAL_SHARD = ItemSpriteSheet.MISC_CONSUMABLE + 16;
  static readonly BROKEN_STAFF = ItemSpriteSheet.MISC_CONSUMABLE + 17;
  static readonly CLOAK_SCRAP = ItemSpriteSheet.MISC_CONSUMABLE + 18;
  static readonly BOW_FRAGMENT = ItemSpriteSheet.MISC_CONSUMABLE + 19;
  static readonly BROKEN_HILT = ItemSpriteSheet.MISC_CONSUMABLE + 20;
  static readonly TORN_PAGE = ItemSpriteSheet.MISC_CONSUMABLE + 21;
  static readonly TRINKET_CATA = ItemSpriteSheet.MISC_CONSUMABLE + 22;

  // Bombs (16 slots) – xy(1,6) = 80
  private static readonly BOMBS = xy(1, 6);
  static readonly BOMB = ItemSpriteSheet.BOMBS + 0;
  static readonly DBL_BOMB = ItemSpriteSheet.BOMBS + 1;
  static readonly FIRE_BOMB = ItemSpriteSheet.BOMBS + 2;
  static readonly FROST_BOMB = ItemSpriteSheet.BOMBS + 3;
  static readonly REGROWTH_BOMB = ItemSpriteSheet.BOMBS + 4;
  static readonly SMOKE_BOMB = ItemSpriteSheet.BOMBS + 5;
  static readonly FLASHBANG = ItemSpriteSheet.BOMBS + 6;
  static readonly HOLY_BOMB = ItemSpriteSheet.BOMBS + 7;
  static readonly WOOLY_BOMB = ItemSpriteSheet.BOMBS + 8;
  static readonly NOISEMAKER = ItemSpriteSheet.BOMBS + 9;
  static readonly ARCANE_BOMB = ItemSpriteSheet.BOMBS + 10;
  static readonly SHRAPNEL_BOMB = ItemSpriteSheet.BOMBS + 11;

  // Weapon tier 1 (8 slots) – xy(1,7) = 96
  private static readonly WEP_TIER1 = xy(1, 7);
  static readonly WORN_SHORTSWORD = ItemSpriteSheet.WEP_TIER1 + 0;
  static readonly CUDGEL = ItemSpriteSheet.WEP_TIER1 + 1;
  static readonly GLOVES = ItemSpriteSheet.WEP_TIER1 + 2;
  static readonly RAPIER = ItemSpriteSheet.WEP_TIER1 + 3;
  static readonly DAGGER = ItemSpriteSheet.WEP_TIER1 + 4;
  static readonly MAGES_STAFF = ItemSpriteSheet.WEP_TIER1 + 5;

  // Weapon tier 2 (8 slots) – xy(9,7) = 104
  private static readonly WEP_TIER2 = xy(9, 7);
  static readonly SHORTSWORD = ItemSpriteSheet.WEP_TIER2 + 0;
  static readonly HAND_AXE = ItemSpriteSheet.WEP_TIER2 + 1;
  static readonly SPEAR = ItemSpriteSheet.WEP_TIER2 + 2;
  static readonly QUARTERSTAFF = ItemSpriteSheet.WEP_TIER2 + 3;
  static readonly DIRK = ItemSpriteSheet.WEP_TIER2 + 4;
  static readonly SICKLE = ItemSpriteSheet.WEP_TIER2 + 5;

  // Weapon tier 3 (8 slots) – xy(1,8) = 112
  private static readonly WEP_TIER3 = xy(1, 8);
  static readonly SWORD = ItemSpriteSheet.WEP_TIER3 + 0;
  static readonly MACE = ItemSpriteSheet.WEP_TIER3 + 1;
  static readonly SCIMITAR = ItemSpriteSheet.WEP_TIER3 + 2;
  static readonly ROUND_SHIELD = ItemSpriteSheet.WEP_TIER3 + 3;
  static readonly SAI = ItemSpriteSheet.WEP_TIER3 + 4;
  static readonly WHIP = ItemSpriteSheet.WEP_TIER3 + 5;

  // Weapon tier 4 (8 slots) – xy(9,8) = 120
  private static readonly WEP_TIER4 = xy(9, 8);
  static readonly LONGSWORD = ItemSpriteSheet.WEP_TIER4 + 0;
  static readonly BATTLE_AXE = ItemSpriteSheet.WEP_TIER4 + 1;
  static readonly FLAIL = ItemSpriteSheet.WEP_TIER4 + 2;
  static readonly RUNIC_BLADE = ItemSpriteSheet.WEP_TIER4 + 3;
  static readonly ASSASSINS_BLADE = ItemSpriteSheet.WEP_TIER4 + 4;
  static readonly CROSSBOW = ItemSpriteSheet.WEP_TIER4 + 5;
  static readonly KATANA = ItemSpriteSheet.WEP_TIER4 + 6;

  // Weapon tier 5 (8 slots) – xy(1,9) = 128
  private static readonly WEP_TIER5 = xy(1, 9);
  static readonly GREATSWORD = ItemSpriteSheet.WEP_TIER5 + 0;
  static readonly WAR_HAMMER = ItemSpriteSheet.WEP_TIER5 + 1;
  static readonly GLAIVE = ItemSpriteSheet.WEP_TIER5 + 2;
  static readonly GREATAXE = ItemSpriteSheet.WEP_TIER5 + 3;
  static readonly GREATSHIELD = ItemSpriteSheet.WEP_TIER5 + 4;
  static readonly GAUNTLETS = ItemSpriteSheet.WEP_TIER5 + 5;
  static readonly WAR_SCYTHE = ItemSpriteSheet.WEP_TIER5 + 6;

  // Missile weapons (16 slots) – xy(1,10) = 144
  private static readonly MISSILE_WEP = xy(1, 10);
  static readonly SPIRIT_BOW = ItemSpriteSheet.MISSILE_WEP + 0;
  static readonly THROWING_SPIKE = ItemSpriteSheet.MISSILE_WEP + 1;
  static readonly THROWING_KNIFE = ItemSpriteSheet.MISSILE_WEP + 2;
  static readonly THROWING_STONE = ItemSpriteSheet.MISSILE_WEP + 3;
  static readonly FISHING_SPEAR = ItemSpriteSheet.MISSILE_WEP + 4;
  static readonly SHURIKEN = ItemSpriteSheet.MISSILE_WEP + 5;
  static readonly THROWING_CLUB = ItemSpriteSheet.MISSILE_WEP + 6;
  static readonly THROWING_SPEAR = ItemSpriteSheet.MISSILE_WEP + 7;
  static readonly BOLAS = ItemSpriteSheet.MISSILE_WEP + 8;
  static readonly KUNAI = ItemSpriteSheet.MISSILE_WEP + 9;
  static readonly JAVELIN = ItemSpriteSheet.MISSILE_WEP + 10;
  static readonly TOMAHAWK = ItemSpriteSheet.MISSILE_WEP + 11;
  static readonly BOOMERANG = ItemSpriteSheet.MISSILE_WEP + 12;
  static readonly TRIDENT = ItemSpriteSheet.MISSILE_WEP + 13;
  static readonly THROWING_HAMMER = ItemSpriteSheet.MISSILE_WEP + 14;
  static readonly FORCE_CUBE = ItemSpriteSheet.MISSILE_WEP + 15;

  // Darts (16 slots) – xy(1,11) = 160
  private static readonly DARTS = xy(1, 11);
  static readonly DART = ItemSpriteSheet.DARTS + 0;
  static readonly ROT_DART = ItemSpriteSheet.DARTS + 1;
  static readonly INCENDIARY_DART = ItemSpriteSheet.DARTS + 2;
  static readonly ADRENALINE_DART = ItemSpriteSheet.DARTS + 3;
  static readonly HEALING_DART = ItemSpriteSheet.DARTS + 4;
  static readonly CHILLING_DART = ItemSpriteSheet.DARTS + 5;
  static readonly SHOCKING_DART = ItemSpriteSheet.DARTS + 6;
  static readonly POISON_DART = ItemSpriteSheet.DARTS + 7;
  static readonly CLEANSING_DART = ItemSpriteSheet.DARTS + 8;
  static readonly PARALYTIC_DART = ItemSpriteSheet.DARTS + 9;
  static readonly HOLY_DART = ItemSpriteSheet.DARTS + 10;
  static readonly DISPLACING_DART = ItemSpriteSheet.DARTS + 11;
  static readonly BLINDING_DART = ItemSpriteSheet.DARTS + 12;

  // Armor (16 slots) – xy(1,12) = 176
  private static readonly ARMOR = xy(1, 12);
  static readonly ARMOR_CLOTH = ItemSpriteSheet.ARMOR + 0;
  static readonly ARMOR_LEATHER = ItemSpriteSheet.ARMOR + 1;
  static readonly ARMOR_MAIL = ItemSpriteSheet.ARMOR + 2;
  static readonly ARMOR_SCALE = ItemSpriteSheet.ARMOR + 3;
  static readonly ARMOR_PLATE = ItemSpriteSheet.ARMOR + 4;
  static readonly ARMOR_WARRIOR = ItemSpriteSheet.ARMOR + 5;
  static readonly ARMOR_MAGE = ItemSpriteSheet.ARMOR + 6;
  static readonly ARMOR_ROGUE = ItemSpriteSheet.ARMOR + 7;
  static readonly ARMOR_HUNTRESS = ItemSpriteSheet.ARMOR + 8;
  static readonly ARMOR_DUELIST = ItemSpriteSheet.ARMOR + 9;
  static readonly ARMOR_CLERIC = ItemSpriteSheet.ARMOR + 10;

  // Wands (16 slots) – xy(1,14) = 208
  private static readonly WANDS = xy(1, 14);
  static readonly WAND_MAGIC_MISSILE = ItemSpriteSheet.WANDS + 0;
  static readonly WAND_FIREBOLT = ItemSpriteSheet.WANDS + 1;
  static readonly WAND_FROST = ItemSpriteSheet.WANDS + 2;
  static readonly WAND_LIGHTNING = ItemSpriteSheet.WANDS + 3;
  static readonly WAND_DISINTEGRATION = ItemSpriteSheet.WANDS + 4;
  static readonly WAND_PRISMATIC_LIGHT = ItemSpriteSheet.WANDS + 5;
  static readonly WAND_CORROSION = ItemSpriteSheet.WANDS + 6;
  static readonly WAND_LIVING_EARTH = ItemSpriteSheet.WANDS + 7;
  static readonly WAND_BLAST_WAVE = ItemSpriteSheet.WANDS + 8;
  static readonly WAND_CORRUPTION = ItemSpriteSheet.WANDS + 9;
  static readonly WAND_WARDING = ItemSpriteSheet.WANDS + 10;
  static readonly WAND_REGROWTH = ItemSpriteSheet.WANDS + 11;
  static readonly WAND_TRANSFUSION = ItemSpriteSheet.WANDS + 12;

  // Rings (16 slots) – xy(1,15) = 224
  private static readonly RINGS = xy(1, 15);
  static readonly RING_GARNET = ItemSpriteSheet.RINGS + 0;
  static readonly RING_RUBY = ItemSpriteSheet.RINGS + 1;
  static readonly RING_TOPAZ = ItemSpriteSheet.RINGS + 2;
  static readonly RING_EMERALD = ItemSpriteSheet.RINGS + 3;
  static readonly RING_ONYX = ItemSpriteSheet.RINGS + 4;
  static readonly RING_OPAL = ItemSpriteSheet.RINGS + 5;
  static readonly RING_TOURMALINE = ItemSpriteSheet.RINGS + 6;
  static readonly RING_SAPPHIRE = ItemSpriteSheet.RINGS + 7;
  static readonly RING_AMETHYST = ItemSpriteSheet.RINGS + 8;
  static readonly RING_QUARTZ = ItemSpriteSheet.RINGS + 9;
  static readonly RING_AGATE = ItemSpriteSheet.RINGS + 10;
  static readonly RING_DIAMOND = ItemSpriteSheet.RINGS + 11;

  // Artifacts (32 slots) – xy(1,16) = 240
  private static readonly ARTIFACTS = xy(1, 16);
  static readonly ARTIFACT_CLOAK = ItemSpriteSheet.ARTIFACTS + 0;
  static readonly ARTIFACT_ARMBAND = ItemSpriteSheet.ARTIFACTS + 1;
  static readonly ARTIFACT_CAPE = ItemSpriteSheet.ARTIFACTS + 2;
  static readonly ARTIFACT_TALISMAN = ItemSpriteSheet.ARTIFACTS + 3;
  static readonly ARTIFACT_HOURGLASS = ItemSpriteSheet.ARTIFACTS + 4;
  static readonly ARTIFACT_TOOLKIT = ItemSpriteSheet.ARTIFACTS + 5;
  static readonly ARTIFACT_SPELLBOOK = ItemSpriteSheet.ARTIFACTS + 6;
  static readonly ARTIFACT_BEACON = ItemSpriteSheet.ARTIFACTS + 7;
  static readonly ARTIFACT_CHAINS = ItemSpriteSheet.ARTIFACTS + 8;
  static readonly ARTIFACT_HORN1 = ItemSpriteSheet.ARTIFACTS + 9;
  static readonly ARTIFACT_HORN2 = ItemSpriteSheet.ARTIFACTS + 10;
  static readonly ARTIFACT_HORN3 = ItemSpriteSheet.ARTIFACTS + 11;
  static readonly ARTIFACT_HORN4 = ItemSpriteSheet.ARTIFACTS + 12;
  static readonly ARTIFACT_CHALICE1 = ItemSpriteSheet.ARTIFACTS + 13;
  static readonly ARTIFACT_CHALICE2 = ItemSpriteSheet.ARTIFACTS + 14;
  static readonly ARTIFACT_CHALICE3 = ItemSpriteSheet.ARTIFACTS + 15;
  static readonly ARTIFACT_SANDALS = ItemSpriteSheet.ARTIFACTS + 16;
  static readonly ARTIFACT_SHOES = ItemSpriteSheet.ARTIFACTS + 17;
  static readonly ARTIFACT_BOOTS = ItemSpriteSheet.ARTIFACTS + 18;
  static readonly ARTIFACT_GREAVES = ItemSpriteSheet.ARTIFACTS + 19;
  static readonly ARTIFACT_ROSE1 = ItemSpriteSheet.ARTIFACTS + 20;
  static readonly ARTIFACT_ROSE2 = ItemSpriteSheet.ARTIFACTS + 21;
  static readonly ARTIFACT_ROSE3 = ItemSpriteSheet.ARTIFACTS + 22;
  static readonly ARTIFACT_TOME = ItemSpriteSheet.ARTIFACTS + 23;
  static readonly ARTIFACT_KEY = ItemSpriteSheet.ARTIFACTS + 24;

  // Trinkets (32 slots) – xy(1,18) = 272
  private static readonly TRINKETS = xy(1, 18);
  static readonly RAT_SKULL = ItemSpriteSheet.TRINKETS + 0;
  static readonly PARCHMENT_SCRAP = ItemSpriteSheet.TRINKETS + 1;
  static readonly PETRIFIED_SEED = ItemSpriteSheet.TRINKETS + 2;
  static readonly EXOTIC_CRYSTALS = ItemSpriteSheet.TRINKETS + 3;
  static readonly MOSSY_CLUMP = ItemSpriteSheet.TRINKETS + 4;
  static readonly SUNDIAL = ItemSpriteSheet.TRINKETS + 5;
  static readonly CLOVER = ItemSpriteSheet.TRINKETS + 6;
  static readonly TRAP_MECHANISM = ItemSpriteSheet.TRINKETS + 7;
  static readonly MIMIC_TOOTH = ItemSpriteSheet.TRINKETS + 8;
  static readonly WONDROUS_RESIN = ItemSpriteSheet.TRINKETS + 9;
  static readonly EYE_OF_NEWT = ItemSpriteSheet.TRINKETS + 10;
  static readonly SALT_CUBE = ItemSpriteSheet.TRINKETS + 11;
  static readonly BLOOD_VIAL = ItemSpriteSheet.TRINKETS + 12;
  static readonly OBLIVION_SHARD = ItemSpriteSheet.TRINKETS + 13;
  static readonly CHAOTIC_CENSER = ItemSpriteSheet.TRINKETS + 14;
  static readonly FERRET_TUFT = ItemSpriteSheet.TRINKETS + 15;
  static readonly SPYGLASS = ItemSpriteSheet.TRINKETS + 16;

  // Scrolls (16 slots) – xy(1,20) = 304
  private static readonly SCROLLS = xy(1, 20);
  static readonly SCROLL_KAUNAN = ItemSpriteSheet.SCROLLS + 0;
  static readonly SCROLL_SOWILO = ItemSpriteSheet.SCROLLS + 1;
  static readonly SCROLL_LAGUZ = ItemSpriteSheet.SCROLLS + 2;
  static readonly SCROLL_YNGVI = ItemSpriteSheet.SCROLLS + 3;
  static readonly SCROLL_GYFU = ItemSpriteSheet.SCROLLS + 4;
  static readonly SCROLL_RAIDO = ItemSpriteSheet.SCROLLS + 5;
  static readonly SCROLL_ISAZ = ItemSpriteSheet.SCROLLS + 6;
  static readonly SCROLL_MANNAZ = ItemSpriteSheet.SCROLLS + 7;
  static readonly SCROLL_NAUDIZ = ItemSpriteSheet.SCROLLS + 8;
  static readonly SCROLL_BERKANAN = ItemSpriteSheet.SCROLLS + 9;
  static readonly SCROLL_ODAL = ItemSpriteSheet.SCROLLS + 10;
  static readonly SCROLL_TIWAZ = ItemSpriteSheet.SCROLLS + 11;
  static readonly ARCANE_RESIN = ItemSpriteSheet.SCROLLS + 13;

  // Exotic scrolls (16 slots) – xy(1,21) = 320
  private static readonly EXOTIC_SCROLLS = xy(1, 21);
  static readonly EXOTIC_KAUNAN = ItemSpriteSheet.EXOTIC_SCROLLS + 0;
  static readonly EXOTIC_SOWILO = ItemSpriteSheet.EXOTIC_SCROLLS + 1;
  static readonly EXOTIC_LAGUZ = ItemSpriteSheet.EXOTIC_SCROLLS + 2;
  static readonly EXOTIC_YNGVI = ItemSpriteSheet.EXOTIC_SCROLLS + 3;
  static readonly EXOTIC_GYFU = ItemSpriteSheet.EXOTIC_SCROLLS + 4;
  static readonly EXOTIC_RAIDO = ItemSpriteSheet.EXOTIC_SCROLLS + 5;
  static readonly EXOTIC_ISAZ = ItemSpriteSheet.EXOTIC_SCROLLS + 6;
  static readonly EXOTIC_MANNAZ = ItemSpriteSheet.EXOTIC_SCROLLS + 7;
  static readonly EXOTIC_NAUDIZ = ItemSpriteSheet.EXOTIC_SCROLLS + 8;
  static readonly EXOTIC_BERKANAN = ItemSpriteSheet.EXOTIC_SCROLLS + 9;
  static readonly EXOTIC_ODAL = ItemSpriteSheet.EXOTIC_SCROLLS + 10;
  static readonly EXOTIC_TIWAZ = ItemSpriteSheet.EXOTIC_SCROLLS + 11;

  // Stones (16 slots) – xy(1,22) = 336
  private static readonly STONES = xy(1, 22);
  static readonly STONE_AGGRESSION = ItemSpriteSheet.STONES + 0;
  static readonly STONE_AUGMENTATION = ItemSpriteSheet.STONES + 1;
  static readonly STONE_FEAR = ItemSpriteSheet.STONES + 2;
  static readonly STONE_BLAST = ItemSpriteSheet.STONES + 3;
  static readonly STONE_BLINK = ItemSpriteSheet.STONES + 4;
  static readonly STONE_CLAIRVOYANCE = ItemSpriteSheet.STONES + 5;
  static readonly STONE_SLEEP = ItemSpriteSheet.STONES + 6;
  static readonly STONE_DETECT = ItemSpriteSheet.STONES + 7;
  static readonly STONE_ENCHANT = ItemSpriteSheet.STONES + 8;
  static readonly STONE_FLOCK = ItemSpriteSheet.STONES + 9;
  static readonly STONE_INTUITION = ItemSpriteSheet.STONES + 10;
  static readonly STONE_SHOCK = ItemSpriteSheet.STONES + 11;

  // Potions (16 slots) – xy(1,23) = 352
  private static readonly POTIONS = xy(1, 23);
  static readonly POTION_CRIMSON = ItemSpriteSheet.POTIONS + 0;
  static readonly POTION_AMBER = ItemSpriteSheet.POTIONS + 1;
  static readonly POTION_GOLDEN = ItemSpriteSheet.POTIONS + 2;
  static readonly POTION_JADE = ItemSpriteSheet.POTIONS + 3;
  static readonly POTION_TURQUOISE = ItemSpriteSheet.POTIONS + 4;
  static readonly POTION_AZURE = ItemSpriteSheet.POTIONS + 5;
  static readonly POTION_INDIGO = ItemSpriteSheet.POTIONS + 6;
  static readonly POTION_MAGENTA = ItemSpriteSheet.POTIONS + 7;
  static readonly POTION_BISTRE = ItemSpriteSheet.POTIONS + 8;
  static readonly POTION_CHARCOAL = ItemSpriteSheet.POTIONS + 9;
  static readonly POTION_SILVER = ItemSpriteSheet.POTIONS + 10;
  static readonly POTION_IVORY = ItemSpriteSheet.POTIONS + 11;
  static readonly LIQUID_METAL = ItemSpriteSheet.POTIONS + 13;

  // Exotic potions (16 slots) – xy(1,24) = 368
  private static readonly EXOTIC_POTIONS = xy(1, 24);
  static readonly EXOTIC_CRIMSON = ItemSpriteSheet.EXOTIC_POTIONS + 0;
  static readonly EXOTIC_AMBER = ItemSpriteSheet.EXOTIC_POTIONS + 1;
  static readonly EXOTIC_GOLDEN = ItemSpriteSheet.EXOTIC_POTIONS + 2;
  static readonly EXOTIC_JADE = ItemSpriteSheet.EXOTIC_POTIONS + 3;
  static readonly EXOTIC_TURQUOISE = ItemSpriteSheet.EXOTIC_POTIONS + 4;
  static readonly EXOTIC_AZURE = ItemSpriteSheet.EXOTIC_POTIONS + 5;
  static readonly EXOTIC_INDIGO = ItemSpriteSheet.EXOTIC_POTIONS + 6;
  static readonly EXOTIC_MAGENTA = ItemSpriteSheet.EXOTIC_POTIONS + 7;
  static readonly EXOTIC_BISTRE = ItemSpriteSheet.EXOTIC_POTIONS + 8;
  static readonly EXOTIC_CHARCOAL = ItemSpriteSheet.EXOTIC_POTIONS + 9;
  static readonly EXOTIC_SILVER = ItemSpriteSheet.EXOTIC_POTIONS + 10;
  static readonly EXOTIC_IVORY = ItemSpriteSheet.EXOTIC_POTIONS + 11;

  // Seeds (16 slots) – xy(1,25) = 384
  private static readonly SEEDS = xy(1, 25);
  static readonly SEED_ROTBERRY = ItemSpriteSheet.SEEDS + 0;
  static readonly SEED_FIREBLOOM = ItemSpriteSheet.SEEDS + 1;
  static readonly SEED_SWIFTTHISTLE = ItemSpriteSheet.SEEDS + 2;
  static readonly SEED_SUNGRASS = ItemSpriteSheet.SEEDS + 3;
  static readonly SEED_ICECAP = ItemSpriteSheet.SEEDS + 4;
  static readonly SEED_STORMVINE = ItemSpriteSheet.SEEDS + 5;
  static readonly SEED_SORROWMOSS = ItemSpriteSheet.SEEDS + 6;
  static readonly SEED_MAGEROYAL = ItemSpriteSheet.SEEDS + 7;
  static readonly SEED_EARTHROOT = ItemSpriteSheet.SEEDS + 8;
  static readonly SEED_STARFLOWER = ItemSpriteSheet.SEEDS + 9;
  static readonly SEED_FADELEAF = ItemSpriteSheet.SEEDS + 10;
  static readonly SEED_BLINDWEED = ItemSpriteSheet.SEEDS + 11;

  // Brews (8 slots) – xy(1,26) = 400
  private static readonly BREWS = xy(1, 26);
  static readonly BREW_INFERNAL = ItemSpriteSheet.BREWS + 0;
  static readonly BREW_BLIZZARD = ItemSpriteSheet.BREWS + 1;
  static readonly BREW_SHOCKING = ItemSpriteSheet.BREWS + 2;
  static readonly BREW_CAUSTIC = ItemSpriteSheet.BREWS + 3;
  static readonly BREW_AQUA = ItemSpriteSheet.BREWS + 4;
  static readonly BREW_UNSTABLE = ItemSpriteSheet.BREWS + 5;

  // Elixirs (8 slots) – xy(9,26) = 408
  private static readonly ELIXIRS = xy(9, 26);
  static readonly ELIXIR_HONEY = ItemSpriteSheet.ELIXIRS + 0;
  static readonly ELIXIR_AQUA = ItemSpriteSheet.ELIXIRS + 1;
  static readonly ELIXIR_MIGHT = ItemSpriteSheet.ELIXIRS + 2;
  static readonly ELIXIR_DRAGON = ItemSpriteSheet.ELIXIRS + 3;
  static readonly ELIXIR_TOXIC = ItemSpriteSheet.ELIXIRS + 4;
  static readonly ELIXIR_ICY = ItemSpriteSheet.ELIXIRS + 5;
  static readonly ELIXIR_ARCANE = ItemSpriteSheet.ELIXIRS + 6;
  static readonly ELIXIR_FEATHER = ItemSpriteSheet.ELIXIRS + 7;

  // Spells (16 slots) – xy(1,27) = 416
  private static readonly SPELLS = xy(1, 27);
  static readonly WILD_ENERGY = ItemSpriteSheet.SPELLS + 0;
  static readonly PHASE_SHIFT = ItemSpriteSheet.SPELLS + 1;
  static readonly TELE_GRAB = ItemSpriteSheet.SPELLS + 2;
  static readonly UNSTABLE_SPELL = ItemSpriteSheet.SPELLS + 3;
  static readonly CURSE_INFUSE = ItemSpriteSheet.SPELLS + 5;
  static readonly MAGIC_INFUSE = ItemSpriteSheet.SPELLS + 6;
  static readonly ALCHEMIZE = ItemSpriteSheet.SPELLS + 7;
  static readonly RECYCLE = ItemSpriteSheet.SPELLS + 8;
  static readonly RECLAIM_TRAP = ItemSpriteSheet.SPELLS + 10;
  static readonly RETURN_BEACON = ItemSpriteSheet.SPELLS + 11;
  static readonly SUMMON_ELE = ItemSpriteSheet.SPELLS + 12;

  // Food (16 slots) – xy(1,28) = 432
  private static readonly FOOD = xy(1, 28);
  static readonly MEAT = ItemSpriteSheet.FOOD + 0;
  static readonly STEAK = ItemSpriteSheet.FOOD + 1;
  static readonly STEWED = ItemSpriteSheet.FOOD + 2;
  static readonly OVERPRICED = ItemSpriteSheet.FOOD + 3;
  static readonly CARPACCIO = ItemSpriteSheet.FOOD + 4;
  static readonly RATION = ItemSpriteSheet.FOOD + 5;
  static readonly PASTY = ItemSpriteSheet.FOOD + 6;
  static readonly MEAT_PIE = ItemSpriteSheet.FOOD + 7;
  static readonly BLANDFRUIT = ItemSpriteSheet.FOOD + 8;
  static readonly BLAND_CHUNKS = ItemSpriteSheet.FOOD + 9;
  static readonly BERRY = ItemSpriteSheet.FOOD + 10;
  static readonly PHANTOM_MEAT = ItemSpriteSheet.FOOD + 11;
  static readonly SUPPLY_RATION = ItemSpriteSheet.FOOD + 12;

  // Holiday food (16 slots) – xy(1,29) = 448
  private static readonly HOLIDAY_FOOD = xy(1, 29);
  static readonly STEAMED_FISH = ItemSpriteSheet.HOLIDAY_FOOD + 0;
  static readonly FISH_LEFTOVER = ItemSpriteSheet.HOLIDAY_FOOD + 1;
  static readonly CHOC_AMULET = ItemSpriteSheet.HOLIDAY_FOOD + 2;
  static readonly EASTER_EGG = ItemSpriteSheet.HOLIDAY_FOOD + 3;
  static readonly RAINBOW_POTION = ItemSpriteSheet.HOLIDAY_FOOD + 4;
  static readonly SHATTERED_CAKE = ItemSpriteSheet.HOLIDAY_FOOD + 5;
  static readonly PUMPKIN_PIE = ItemSpriteSheet.HOLIDAY_FOOD + 6;
  static readonly VANILLA_CAKE = ItemSpriteSheet.HOLIDAY_FOOD + 7;
  static readonly CANDY_CANE = ItemSpriteSheet.HOLIDAY_FOOD + 8;
  static readonly SPARKLING_POTION = ItemSpriteSheet.HOLIDAY_FOOD + 9;

  // Quest (16 slots) – xy(1,30) = 464
  private static readonly QUEST = xy(1, 30);
  static readonly DUST = ItemSpriteSheet.QUEST + 1;
  static readonly CANDLE = ItemSpriteSheet.QUEST + 2;
  static readonly EMBER = ItemSpriteSheet.QUEST + 3;
  static readonly PICKAXE = ItemSpriteSheet.QUEST + 4;
  static readonly ORE = ItemSpriteSheet.QUEST + 5;
  static readonly TOKEN = ItemSpriteSheet.QUEST + 6;
  static readonly BLOB = ItemSpriteSheet.QUEST + 7;
  static readonly SHARD = ItemSpriteSheet.QUEST + 8;
  static readonly ESCAPE = ItemSpriteSheet.QUEST + 9;

  // Bags (16 slots) – xy(1,31) = 480
  private static readonly BAGS = xy(1, 31);
  static readonly WATERSKIN = ItemSpriteSheet.BAGS + 0;
  static readonly BACKPACK = ItemSpriteSheet.BAGS + 1;
  static readonly POUCH = ItemSpriteSheet.BAGS + 2;
  static readonly HOLDER = ItemSpriteSheet.BAGS + 3;
  static readonly BANDOLIER = ItemSpriteSheet.BAGS + 4;
  static readonly HOLSTER = ItemSpriteSheet.BAGS + 5;
  static readonly VIAL = ItemSpriteSheet.BAGS + 6;

  // Documents (16 slots) – xy(1,32) = 496
  private static readonly DOCUMENTS = xy(1, 32);
  static readonly GUIDE_PAGE = ItemSpriteSheet.DOCUMENTS + 0;
  static readonly ALCH_PAGE = ItemSpriteSheet.DOCUMENTS + 1;
  static readonly SEWER_PAGE = ItemSpriteSheet.DOCUMENTS + 2;
  static readonly PRISON_PAGE = ItemSpriteSheet.DOCUMENTS + 3;
  static readonly CAVES_PAGE = ItemSpriteSheet.DOCUMENTS + 4;
  static readonly CITY_PAGE = ItemSpriteSheet.DOCUMENTS + 5;
  static readonly HALLS_PAGE = ItemSpriteSheet.DOCUMENTS + 6;

  // Icons sub-class for 8x8 icons
  static get Icons(): typeof ItemSpriteSheetIcons {
    return ItemSpriteSheetIcons;
  }
}

class ItemSpriteSheetIcons {
  static readonly SIZE = 8;
  private static readonly WIDTH = 16;

  private static xy(x: number, y: number): number {
    x -= 1; y -= 1;
    return x + ItemSpriteSheetIcons.WIDTH * y;
  }

  // Rings (16 slots) – xy(1,1) = 0
  private static readonly RINGS = ItemSpriteSheetIcons.xy(1, 1);
  static readonly RING_ACCURACY = ItemSpriteSheetIcons.RINGS + 0;
  static readonly RING_ARCANA = ItemSpriteSheetIcons.RINGS + 1;
  static readonly RING_ELEMENTS = ItemSpriteSheetIcons.RINGS + 2;
  static readonly RING_ENERGY = ItemSpriteSheetIcons.RINGS + 3;
  static readonly RING_EVASION = ItemSpriteSheetIcons.RINGS + 4;
  static readonly RING_FORCE = ItemSpriteSheetIcons.RINGS + 5;
  static readonly RING_FUROR = ItemSpriteSheetIcons.RINGS + 6;
  static readonly RING_HASTE = ItemSpriteSheetIcons.RINGS + 7;
  static readonly RING_MIGHT = ItemSpriteSheetIcons.RINGS + 8;
  static readonly RING_SHARPSHOOT = ItemSpriteSheetIcons.RINGS + 9;
  static readonly RING_TENACITY = ItemSpriteSheetIcons.RINGS + 10;
  static readonly RING_WEALTH = ItemSpriteSheetIcons.RINGS + 11;

  // Scrolls (16 slots) – xy(1,3) = 32
  private static readonly SCROLLS = ItemSpriteSheetIcons.xy(1, 3);
  static readonly SCROLL_UPGRADE = ItemSpriteSheetIcons.SCROLLS + 0;
  static readonly SCROLL_IDENTIFY = ItemSpriteSheetIcons.SCROLLS + 1;
  static readonly SCROLL_REMCURSE = ItemSpriteSheetIcons.SCROLLS + 2;
  static readonly SCROLL_MIRRORIMG = ItemSpriteSheetIcons.SCROLLS + 3;
  static readonly SCROLL_RECHARGE = ItemSpriteSheetIcons.SCROLLS + 4;
  static readonly SCROLL_TELEPORT = ItemSpriteSheetIcons.SCROLLS + 5;
  static readonly SCROLL_LULLABY = ItemSpriteSheetIcons.SCROLLS + 6;
  static readonly SCROLL_MAGICMAP = ItemSpriteSheetIcons.SCROLLS + 7;
  static readonly SCROLL_RAGE = ItemSpriteSheetIcons.SCROLLS + 8;
  static readonly SCROLL_RETRIB = ItemSpriteSheetIcons.SCROLLS + 9;
  static readonly SCROLL_TERROR = ItemSpriteSheetIcons.SCROLLS + 10;
  static readonly SCROLL_TRANSMUTE = ItemSpriteSheetIcons.SCROLLS + 11;

  // Exotic scrolls (16 slots) – xy(1,4) = 48
  private static readonly EXOTIC_SCROLLS = ItemSpriteSheetIcons.xy(1, 4);
  static readonly SCROLL_ENCHANT = ItemSpriteSheetIcons.EXOTIC_SCROLLS + 0;
  static readonly SCROLL_DIVINATE = ItemSpriteSheetIcons.EXOTIC_SCROLLS + 1;
  static readonly SCROLL_ANTIMAGIC = ItemSpriteSheetIcons.EXOTIC_SCROLLS + 2;
  static readonly SCROLL_PRISIMG = ItemSpriteSheetIcons.EXOTIC_SCROLLS + 3;
  static readonly SCROLL_MYSTENRG = ItemSpriteSheetIcons.EXOTIC_SCROLLS + 4;
  static readonly SCROLL_PASSAGE = ItemSpriteSheetIcons.EXOTIC_SCROLLS + 5;
  static readonly SCROLL_SIREN = ItemSpriteSheetIcons.EXOTIC_SCROLLS + 6;
  static readonly SCROLL_FORESIGHT = ItemSpriteSheetIcons.EXOTIC_SCROLLS + 7;
  static readonly SCROLL_CHALLENGE = ItemSpriteSheetIcons.EXOTIC_SCROLLS + 8;
  static readonly SCROLL_PSIBLAST = ItemSpriteSheetIcons.EXOTIC_SCROLLS + 9;
  static readonly SCROLL_DREAD = ItemSpriteSheetIcons.EXOTIC_SCROLLS + 10;
  static readonly SCROLL_METAMORPH = ItemSpriteSheetIcons.EXOTIC_SCROLLS + 11;

  // Potions (16 slots) – xy(1,6) = 80
  private static readonly POTIONS = ItemSpriteSheetIcons.xy(1, 6);
  static readonly POTION_STRENGTH = ItemSpriteSheetIcons.POTIONS + 0;
  static readonly POTION_HEALING = ItemSpriteSheetIcons.POTIONS + 1;
  static readonly POTION_MINDVIS = ItemSpriteSheetIcons.POTIONS + 2;
  static readonly POTION_FROST = ItemSpriteSheetIcons.POTIONS + 3;
  static readonly POTION_LIQFLAME = ItemSpriteSheetIcons.POTIONS + 4;
  static readonly POTION_TOXICGAS = ItemSpriteSheetIcons.POTIONS + 5;
  static readonly POTION_HASTE = ItemSpriteSheetIcons.POTIONS + 6;
  static readonly POTION_INVIS = ItemSpriteSheetIcons.POTIONS + 7;
  static readonly POTION_LEVITATE = ItemSpriteSheetIcons.POTIONS + 8;
  static readonly POTION_PARAGAS = ItemSpriteSheetIcons.POTIONS + 9;
  static readonly POTION_PURITY = ItemSpriteSheetIcons.POTIONS + 10;
  static readonly POTION_EXP = ItemSpriteSheetIcons.POTIONS + 11;

  // Exotic potions (16 slots) – xy(1,7) = 96
  private static readonly EXOTIC_POTIONS = ItemSpriteSheetIcons.xy(1, 7);
  static readonly POTION_MASTERY = ItemSpriteSheetIcons.EXOTIC_POTIONS + 0;
  static readonly POTION_SHIELDING = ItemSpriteSheetIcons.EXOTIC_POTIONS + 1;
  static readonly POTION_MAGISIGHT = ItemSpriteSheetIcons.EXOTIC_POTIONS + 2;
  static readonly POTION_SNAPFREEZ = ItemSpriteSheetIcons.EXOTIC_POTIONS + 3;
  static readonly POTION_DRGBREATH = ItemSpriteSheetIcons.EXOTIC_POTIONS + 4;
  static readonly POTION_CORROGAS = ItemSpriteSheetIcons.EXOTIC_POTIONS + 5;
  static readonly POTION_STAMINA = ItemSpriteSheetIcons.EXOTIC_POTIONS + 6;
  static readonly POTION_SHROUDFOG = ItemSpriteSheetIcons.EXOTIC_POTIONS + 7;
  static readonly POTION_STRMCLOUD = ItemSpriteSheetIcons.EXOTIC_POTIONS + 8;
  static readonly POTION_EARTHARMR = ItemSpriteSheetIcons.EXOTIC_POTIONS + 9;
  static readonly POTION_CLEANSE = ItemSpriteSheetIcons.EXOTIC_POTIONS + 10;
  static readonly POTION_DIVINE = ItemSpriteSheetIcons.EXOTIC_POTIONS + 11;
}
