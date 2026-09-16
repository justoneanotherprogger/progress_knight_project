"""Rename item/category keys in locale YAML files from old names to content ids."""

import re
import sys
from pathlib import Path

# Old name -> new key mapping
RENAMES = {
    # Category names
    "Properties": "category_properties",
    "Misc": "category_misc",
    # Property item names (longest first within group to avoid partial matches)
    "Observable Universe": "item_observable_universe_name",
    "Galaxy Filament": "item_galaxy_filament_name",
    "Stellar Neighborhood": "item_stellar_neighborhood_name",
    "Pocket Dimension": "item_pocket_dimension_name",
    "Grand Palace": "item_grand_palace_name",
    "Small Palace": "item_small_palace_name",
    "Large House": "item_large_house_name",
    "Town Ruler": "item_town_ruler_name",
    "City Ruler": "item_city_ruler_name",
    "Nation Ruler": "item_nation_ruler_name",
    "Galactic Throne": "item_galactic_throne_name",
    "Void Universe": "item_void_universe_name",
    "Wooden Hut": "item_wooden_hut_name",
    "Quantum World": "item_quantum_world_name",
    "Boötes Void": "item_bootes_void_name",
    "Void Realm": "item_void_realm_name",
    "Astral Realm": "item_astral_realm_name",
    "Supercluster": "item_supercluster_name",
    "Spaceship": "item_spaceship_name",
    "Ringworld": "item_ringworld_name",
    "Homeless": "item_homeless_name",
    "Multiverse": "item_multiverse_name",
    "Galaxy": "item_galaxy_name",
    "Planet": "item_planet_name",
    "Cottage": "item_cottage_name",
    "Tent": "item_tent_name",
    "House": "item_house_name",
    # Misc item names (longest first)
    "Multiverse Fragment": "item_multiverse_fragment_name",
    "Universe Fragment": "item_universe_fragment_name",
    "Stairway to heaven": "item_stairway_to_heaven_name",
    "Highway to hell": "item_highway_to_hell_name",
    "Personal Squire": "item_personal_squire_name",
    "Steel Longsword": "item_steel_longsword_name",
    "Celestial Robe": "item_celestial_robe_name",
    "Sapphire Charm": "item_sapphire_charm_name",
    "Void Necklace": "item_void_necklace_name",
    "Custom Galaxy": "item_custom_galaxy_name",
    "Mind's Eye": "item_minds_eye_name",
    "Desintegration": "item_desintegration_name",
    "Hypersphere": "item_hypersphere_name",
    "Tesseract": "item_tesseract_name",
    "Void Armor": "item_void_armor_name",
    "Void Blade": "item_void_blade_name",
    "Study Desk": "item_study_desk_name",
    "Void Dust": "item_void_dust_name",
    "Void Orb": "item_void_orb_name",
    "Butler": "item_butler_name",
    "Dumbbells": "item_dumbbells_name",
    "Library": "item_library_name",
    "Book": "item_book_name",
    "Observatory": "item_observatory_name",
}

# Build tooltip renames from name renames
TOOLTIP_RENAMES = {}
for old, new in RENAMES.items():
    if old in ("Properties", "Misc"):
        continue  # categories don't have tooltips
    TOOLTIP_RENAMES[f"tt_{old}"] = new.replace("_name", "_tooltip")

ALL_RENAMES = {**RENAMES, **TOOLTIP_RENAMES}


def rename_keys_in_file(filepath):
    text = filepath.read_text(encoding="utf-8")
    original = text

    # Sort by length descending to avoid partial matches (e.g. "Multiverse" before "Multiverse Fragment")
    sorted_keys = sorted(ALL_RENAMES.keys(), key=len, reverse=True)

    for old_key in sorted_keys:
        new_key = ALL_RENAMES[old_key]
        # Match old_key at start of YAML line (possibly with leading whitespace)
        # Uses word boundary after key to avoid matching "Multiverse" inside "Multiverse Fragment"
        pattern = re.compile(r"^(\s*)" + re.escape(old_key) + r"(\s*:)", re.MULTILINE)
        text = pattern.sub(rf"\g<1>{new_key}\2", text)

    if text != original:
        filepath.write_text(text, encoding="utf-8")
        print(f"  Renamed keys in {filepath}")
    else:
        print(f"  No changes in {filepath}")


def main():
    base = Path("locales")
    langs = ["en", "ru"]

    for lang in langs:
        lang_dir = base / lang
        if not lang_dir.exists():
            print(f"Warning: {lang_dir} not found, skipping")
            continue
        print(f"Processing {lang}/...")
        for yaml_file in sorted(lang_dir.glob("*.yaml")):
            rename_keys_in_file(yaml_file)

    print("Done!")


if __name__ == "__main__":
    main()
