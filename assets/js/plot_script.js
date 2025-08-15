// Viewer1 (2x2)
const setsViewer1 = [
  { folder: "density",      namePart: "dens" },
  { folder: "HII_frac",     namePart: "ion2" },
  { folder: "metal",        namePart: "metal" },
  { folder: "temperature",  namePart: "temp" }
];

// Viewer2 (1x3 + static)
const setsViewer2 = [
  { folder: "density_halo_zoom", namePart: "dens", type: "zBased" },
  { folder: "dm_particles",      namePart: "dm_particles_3d", type: "tBased" },
  { folder: "virial_radius",     namePart: "virial_radius_3d", type: "tBased" }
];
const staticImage = "images/merger_tree.png";

let snapshots = [];
let preloadedImages1 = {};
let preloadedImages2 = {};

// Load snapshots JSON
fetch("assets/snapshots.json")
  .then(res => res.json())
  .then(data => {
    snapshots = data;
    initViewer("slider", "redshiftDisplay", "imageGrid", setsViewer1, preloadedImages1);
    initViewer("slider2", "redshiftDisplay2", "imageGrid2", setsViewer2, preloadedImages2, staticImage);
  });

// Generic viewer initializer
function initViewer(sliderId, displayId, gridId, sets, preloadStore, staticImg = null) {
  const slider = document.getElementById(sliderId);
  const display = document.getElementById(displayId);
  const grid = document.getElementById(gridId);

  slider.min = 0;
  slider.max = snapshots.length - 1;
  slider.value = 0;

  // Create img elements once (3 dynamic for viewer2, 4 for viewer1)
  sets.forEach(() => {
    const img = document.createElement("img");
    img.style.width = "100%";
    img.style.height = "auto";
    grid.appendChild(img);
  });

  if (staticImg) {
    const img = document.createElement("img");
    img.src = staticImg;

    // Force the static image to span the full width (all 3 columns) and sit on the next row.
    img.style.gridColumn = "1 / -1"; // span all columns
    img.style.width = "100%";
    img.style.height = "auto";

    // Optional: make intent explicit for placement
    // (auto-placement already puts it on the next row since it's the 4th item,
    // but this is extra insurance if styles change later)
    img.style.gridRow = "2";

    grid.appendChild(img);
  }

  // Preload images
  snapshots.forEach(snap => {
    const key = snap.id;
    preloadStore[key] = [];
    sets.forEach(set => {
      const img = new Image();
      if (set.type === "tBased") {
        img.src = `images/${set.folder}/halo_idx_74_${set.namePart}_time_${snap.t}.png`;
      } else {
        img.src = `images/${set.folder}/big_proj_halo_74_${set.namePart}_${snap.id}_z${snap.z}.png`;
      }
      preloadStore[key].push(img);
    });
  });

  // Update function
  function update(index) {
    const snap = snapshots[index];
    display.textContent = `Time since Big Bang = ${snap.t} Myr  |  z = ${snap.z}`;
    const imgs = grid.querySelectorAll("img");

    sets.forEach((set, i) => {
      if (set.type === "tBased") {
        imgs[i].src = `images/${set.folder}/halo_idx_74_${set.namePart}_time_${snap.t}.png`;
      } else {
        imgs[i].src = `images/${set.folder}/big_proj_halo_74_${set.namePart}_${snap.id}_z${snap.z}.png`;
      }
      imgs[i].alt = `${set.folder} snapshot ${snap.id}`;
    });

    if (staticImg) {
      // Keep static image source fixed (last element in the grid)
      imgs[sets.length].src = staticImg;
    }
  }

  slider.addEventListener("input", () => update(parseInt(slider.value, 10)));
  update(0);
}