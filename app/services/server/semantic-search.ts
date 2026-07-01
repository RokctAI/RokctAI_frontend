class ServerSemanticSearch {
  private static instance: any = null;

  private async getPipeline() {
    if (!ServerSemanticSearch.instance) {
      // Dynamic import to avoid build-time loading issues with @xenova/transformers/sharp
      const { pipeline } = await import("@xenova/transformers");
      ServerSemanticSearch.instance = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
    }
    return ServerSemanticSearch.instance;
  }

  async getEmbedding(text: string): Promise<number[]> {
    const pipe = await this.getPipeline();
    const output = await pipe(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }

  private cosineSimilarity(a: number[], b: number[]) {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  async rankResults(query: string, results: any[]) {
    if (!results.length) return results;

    const queryEmbedding = await this.getEmbedding(query);
    
    const scoredResults = await Promise.all(
      results.map(async (res) => {
        const text = `${res.title} ${res.institution || ""} ${res.organization || ""} ${res.category || ""}`;
        const resEmbedding = await this.getEmbedding(text);
        const score = this.cosineSimilarity(queryEmbedding, resEmbedding);
        return { ...res, semanticScore: score };
      })
    );

    return scoredResults.sort((a, b) => b.semanticScore - a.semanticScore);
  }
}

export const serverSemanticSearch = new ServerSemanticSearch();
