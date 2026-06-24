module.exports = {
  packagerConfig: {
    asar: false,
    arch: "universal",
    icon: "./assets/icon"
  },
  makers: [
    { name: '@electron-forge/maker-dmg' },
    { name: '@electron-forge/maker-squirrel' },
  ],
};
