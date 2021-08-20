const endpoint = "https://g.tenor.com/v1";
const key = "NVIY5F53SLFQ";
const defaultProps = {
    "media_filter": "minimal",
    "limit": 50
};

let lastFetch = 0;

module.exports = new class TenorClient {
    async executeRequest(cmd, props = {}) {
        while (performance.now() - lastFetch < 500)
            await new Promise(r => setTimeout(r, 100));
        lastFetch = performance.now();

        // This line makes my brain go brr
        return await fetch(`${endpoint}/${cmd}?key=${key}${Object.entries({ ...defaultProps, ...props }).map(([key, value]) => `&${key}=${value}`).join("")}`)
            .then(response => response.json())
            .catch(console.error);
    }

    getTrending(options = {}) {
        return this.executeRequest("trending", options);
    }

    search(query, options = {}) {
        return this.executeRequest("search", { q: query, ...options });
    }

    random(query = "", options = {}) {
        return this.executeRequest("random", { q: query, limit: 1, ...options });
    }
}