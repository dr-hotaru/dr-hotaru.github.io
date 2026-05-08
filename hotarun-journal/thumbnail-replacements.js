(() => {
  const commonPrefix = "https://commons.wikimedia.org/wiki/Special:FilePath/";
  const imageRules = [
    { key: "gene-expression-evolution-repeatability", file: "Computer_with_microarray.jpg", credit: "Wikimedia Commons / National Cancer Institute" },
    { key: "termite-selfish-elements", file: "Transposable_elements_(2).png", credit: "Wikimedia Commons / Arvid Ågren and Andrew G. Clark" },
    { key: "code-genome-editing", file: "CRISPR_Cas9.png", credit: "Wikimedia Commons / CRISPR Cas9" },
    { key: "methylation-sensitive-cas9", file: "Cas9_Apo_Structure.png", credit: "Wikimedia Commons / Ben.lafrance" },
    { key: "cas9-methylation", file: "Cas9_Apo_Structure.png", credit: "Wikimedia Commons / Ben.lafrance" },
    { key: "neocortex-regulatory", file: "DNA_methylation.svg", credit: "Wikimedia Commons / Mariuswalter" },
    { key: "ancient-streptococcus", file: "Streptococcus_pyogenes.jpg", credit: "Wikimedia Commons / CDC PHIL" },
    { key: "ancient-dna-directional-selection", file: "Bell_Beaker_culture.jpg", credit: "Wikimedia Commons / Bell Beaker culture map" },
    { key: "bell-beaker", file: "Bell_Beaker_Rijksmuseum_of_Oudheden_122.jpg", credit: "Wikimedia Commons / Rijksmuseum van Oudheden" },
    { key: "roman-frontier", file: "Bell_Beaker_culture.jpg", credit: "Wikimedia Commons / archaeology map" },
    { key: "coral", file: "Blue_Acropora_coral.jpg", credit: "Wikimedia Commons / Blue Acropora coral" },
    { key: "ocean", file: "Aerial_view_of_the_Great_Barrier_Reef_74.jpg", credit: "Wikimedia Commons / Great Barrier Reef" },
    { key: "fish", file: "Threespine_stickleback.jpg", credit: "Wikimedia Commons / USFWS" },
    { key: "stickleback", file: "Threespine_stickleback.jpg", credit: "Wikimedia Commons / USFWS" },
    { key: "maize", file: "Corn_field.jpg", credit: "Wikimedia Commons / Corn field" },
    { key: "corn", file: "Corn_field.jpg", credit: "Wikimedia Commons / Corn field" },
    { key: "cas9", file: "Cas9_Apo_Structure.png", credit: "Wikimedia Commons / Ben.lafrance" },
    { key: "methylation", file: "DNA_methylation.svg", credit: "Wikimedia Commons / Mariuswalter" },
    { key: "influenza", file: "Influenza_virus_particle_colorized.jpg", credit: "Wikimedia Commons / influenza virus" },
    { key: "malaria", file: "Plasmodium_falciparum_ring_forms_and_gametocytes.jpg", credit: "Wikimedia Commons / CDC" },
    { key: "tuberculosis", file: "Mycobacterium_tuberculosis_SEM.jpg", credit: "Wikimedia Commons / NIAID" },
    { key: "p3h1", file: "Pancreatic_cancer_cells.jpg", credit: "Wikimedia Commons / cancer cells" },
    { key: "cancer", file: "Pancreatic_cancer_cells.jpg", credit: "Wikimedia Commons / cancer cells" },
    { key: "medicine", file: "Laboratory_microscope.jpg", credit: "Wikimedia Commons / laboratory microscope" },
    { key: "drug", file: "Pills_2.jpg", credit: "Wikimedia Commons / medicines" },
    { key: "cyclopeptide", file: "Pills_2.jpg", credit: "Wikimedia Commons / medicines" },
    { key: "lamgen", file: "Pills_2.jpg", credit: "Wikimedia Commons / medicines" },
    { key: "quantum", file: "IBM_Q_system_%28Fraunhofer_2%29.jpg", credit: "Wikimedia Commons / quantum computer" },
    { key: "ml", file: "Artificial_neural_network.svg", credit: "Wikimedia Commons / neural network diagram" },
    { key: "robot", file: "Soft_robotic_gripper.jpg", credit: "Wikimedia Commons / soft robotics" },
    { key: "aluminum", file: "Aluminium_crystal_bar.jpg", credit: "Wikimedia Commons / aluminium" },
    { key: "electrolyte", file: "Lithium-ion_battery.jpg", credit: "Wikimedia Commons / lithium-ion battery" },
    { key: "earthquake", file: "Seismogram.jpg", credit: "Wikimedia Commons / seismogram" },
    { key: "exoplanet", file: "Artist%E2%80%99s_impression_of_an_exoplanet_orbiting_two_stars.jpg", credit: "Wikimedia Commons / ESO" },
    { key: "climate", file: "Clouds_over_the_Atlantic_Ocean.jpg", credit: "Wikimedia Commons / clouds over ocean" },
    { key: "precipitation", file: "Rain_over_forest.jpg", credit: "Wikimedia Commons / rainfall" },
    { key: "forest", file: "Temperate_rainforest_in_the_Mount_Hood_Wilderness.jpg", credit: "Wikimedia Commons / forest" },
    { key: "co2", file: "Carbon_dioxide_3D_spacefill.png", credit: "Wikimedia Commons / carbon dioxide model" },
    { key: "land-vertebrates", file: "African_Bush_Elephant.jpg", credit: "Wikimedia Commons / vertebrate wildlife" },
    { key: "bird", file: "Malurus_cyaneus_male_-_Bruny_Island.jpg", credit: "Wikimedia Commons / superb fairywren" },
    { key: "cooperative", file: "Malurus_cyaneus_male_-_Bruny_Island.jpg", credit: "Wikimedia Commons / superb fairywren" },
    { key: "stentor", file: "Stentor_roeseli_composite_image.jpg", credit: "Wikimedia Commons / Stentor" },
    { key: "squid", file: "Loligo_vulgaris.jpg", credit: "Wikimedia Commons / squid" },
    { key: "trilobite", file: "Trilobite_fossil.jpg", credit: "Wikimedia Commons / trilobite fossil" },
    { key: "archaea", file: "Sulfolobus.jpg", credit: "Wikimedia Commons / archaeon" },
    { key: "asgard", file: "Sulfolobus.jpg", credit: "Wikimedia Commons / archaeon" },
    { key: "microbial", file: "Scanning_electron_micrograph_of_Escherichia_coli.jpg", credit: "Wikimedia Commons / E. coli SEM" },
    { key: "chloroflexota", file: "Scanning_electron_micrograph_of_Escherichia_coli.jpg", credit: "Wikimedia Commons / bacteria SEM" },
    { key: "multicellularity", file: "Volvox_aureus.jpg", credit: "Wikimedia Commons / Volvox" },
    { key: "behavioral", file: "Laboratory_mouse_mg_3216.jpg", credit: "Wikimedia Commons / laboratory animal" },
    { key: "language", file: "Computer_lab.jpg", credit: "Wikimedia Commons / computer lab" },
    { key: "llm", file: "Computer_lab.jpg", credit: "Wikimedia Commons / computer lab" }
  ];

  const fallback = null;

  function pickRuleFromText(text) {
    const haystack = String(text || "").toLowerCase();
    return imageRules.find(rule => haystack.includes(rule.key)) || null;
  }

  function pickImage(img) {
    const sourceText = [img.getAttribute("src"), img.getAttribute("alt")]
      .filter(Boolean)
      .join(" ");
    return pickRuleFromText(sourceText) || pickRuleFromText(img.closest("a, article")?.textContent) || fallback;
  }

  function replacementUrl(file) {
    return `${commonPrefix}${file}?width=1200`;
  }

  window.HotarunThumbnails = {
    resolve(img) {
      const replacement = pickImage(img);
      if (!replacement) return null;
      return {
        src: replacementUrl(replacement.file),
        credit: replacement.credit
      };
    }
  };

  document.querySelectorAll("img").forEach(img => {
    const src = img.getAttribute("src") || "";
    if (!src.includes("assets/thumbs/") && !src.includes("../assets/thumbs/")) return;
    const replacement = window.HotarunThumbnails.resolve(img);
    if (!replacement) return;
    img.src = replacement.src;
    img.onerror = () => {
      img.onerror = null;
      img.classList.remove("non-ai-thumb");
    };
    img.loading = "lazy";
    img.decoding = "async";
    img.dataset.credit = replacement.credit;
    img.classList.add("non-ai-thumb");
  });

  document.querySelectorAll(".post-card").forEach(card => {
    const link = card.querySelector("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    card.dataset.href = href;
    card.tabIndex = 0;
    card.setAttribute("role", "link");
    card.addEventListener("click", event => {
      if (event.target.closest("a")) return;
      window.location.href = href;
    });
    card.addEventListener("keydown", event => {
      if (event.key === "Enter") window.location.href = href;
    });
  });
})();
