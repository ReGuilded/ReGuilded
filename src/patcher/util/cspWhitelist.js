export const cspWhitelist = {
  all: [],
  connect: [
    "raw.githubusercontent.com", // GitHub (Raw)
    "api.github.com", // GitHub API
    "www.github.com", // GitHub
    "objects.githubusercontent.com", // GitHub (Asset)
    "*.reguilded.dev" // ReGuilded Server
  ],
  default: [
    "*.reguilded.dev" // ReGuilded Server
  ],
  font: [
    "fonts.gstatic.com", // Google Fonts
    "*.github.io", // GitLab Pages
    "*.gitlab.io", // GitHub Pages
    "*.gitea.io" // Gitea
  ],
  img: [
    "dl.dropboxusercontent.com", // Dropbox
    "*.google.com", // Google (includes Google Drive)
    "i.imgur.com", // Imgur
    "c.tenor.com", // Tenor
    "*.giphy.com", // Giphy
    "img.icons8.com", // Icons8
    "*.github.io", // GitHub Pages
    "*.gitlab.io", // Gitlab Pages
    "*.github.com", // GitHub
    "*.gitlab.com", // Gitlab
    "*.gitea.io" // Gitea
  ],
  media: [],
  script: [],
  style: [
    "fonts.googleapis.com", // Google Fonts
    "*.guilded.gg", // Guilded
    "*.github.io", // GitHub Pages
    "*.gitlab.io", // Gitlab Pages
    "*.gitea.io" // Gitea
  ]
};

export const defaultCustomCspWhitelist = {
  all: [],
  connect: [],
  default: [],
  font: [],
  img: [],
  media: [],
  script: [],
  style: []
};
