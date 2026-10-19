---
title: "The Missing Rows: Debugging Incomplete Answers in Hybrid Search"
description: "A hybrid search tool found useful passages, then cut them before the assistant could read them. How a small response-limit mismatch produced incomplete answers."
category: "AI engineering"
tags: ["RAG", "Hybrid Search", "MCP", "Retrieval Quality"]
date: 2026-10-19
readingTime: "7 min"
draft: true
---

The answer looked useful. It named the right document, organized the results neatly, and explained which entries matched the question. It was also missing rows that were plainly present in the source.

The question was ordinary: **"List the checks marked Production in the documentation."** No live system inspection was required. The evidence already existed in a Markdown catalog.

It was tempting to blame ranking, the embedding model, or the wording of the prompt. The more revealing question was simpler: what text had actually reached the assistant?

The ingestion pipeline created chunks of up to **3,000 characters**. The retrieval tool returned only the first **2,000 characters** of each selected chunk.

We were finding useful evidence, then cutting part of it off at the last handoff.

This is a generalized account of that debugging exercise. The example identifiers below are illustrative, and the limits describe this implementation, not universal recommendations for RAG.

## Follow the Evidence, Not Just the Answer

The system used retrieval-augmented generation: a search service supplied evidence, and an AI assistant turned that evidence into an answer. The assistant in this workflow was Codex, connected to the search service through MCP.

MCP was the interface between them. The retrieval tool did not write the final explanation. It returned passages and source metadata for the assistant to read.

Documents had already been split into chunks, embedded, and indexed during ingestion. Asking a question did not repeat that preparation for the entire knowledge base.

At question time, the default flow was:

```text
User asks a question
        |
Assistant calls the search tool
        |
Keyword search: up to 15 candidates
Semantic search: up to 15 candidates
        |
Merge, deduplicate, and rank
        |
Select the best 5 chunks
        |
Format text and source references
        |
Codex reads the tool response
and composes an answer
```

The distinction at the bottom matters. Content sitting in the search index is not automatically available to the model. It must survive retrieval, selection, and response formatting first.

## BM25: Find the Words That Matter

The keyword side used BM25, a relevance-scoring method built around matching terms. It considers how often a term occurs, how common it is across the indexed collection, and the length of the indexed text. Term-frequency gains saturate: repeating a word endlessly should not make a passage endlessly more relevant. [Elastic's full-text search overview](https://www.elastic.co/docs/solutions/search/full-text/how-full-text-works) and [BM25 parameters](https://www.elastic.co/guide/en/elasticsearch/reference/8.19/index-modules-similarity.html) explain these components.

For engineering documentation, this is useful for identifiers such as `checkout_health_check`, an error code, or a configuration setting. Exact terminology is often a strong clue.

BM25 is not literal string equality, however. Tokenization and other text analysis affect what matches. Nor does it understand a request for "all" as an instruction to enumerate every catalog row. It ranks matching indexed passages.

## Semantic Search: Find Related Meaning

The semantic side converted the question into an embedding: a numeric representation used to compare it with the embeddings stored for document chunks.

A question about "users getting stuck after signing in" might retrieve a passage about "authentication callback failures," even without identical wording. The embedding model makes that relationship possible; vector search finds nearby representations. [OpenSearch's semantic-search guide](https://docs.opensearch.org/latest/vector-search/ai-search/semantic-search/) describes this retrieval pattern.

Similarity is not proof. A passage can be related to the topic without answering the question, and semantic search can struggle with precise identifiers or subtle distinctions.

That is why the system used both methods. Keyword search supplied lexical evidence; semantic search supplied another route to potentially relevant material. Neither was treated as a completeness check.

## Candidates Are Not the Final Response

A candidate is a chunk under consideration, not one the assistant has necessarily received.

The tool returned five chunks by default and allowed callers to request up to ten. Internally, each retriever used this rule:

```python
candidate_count = min(max(limit * 3, 10), 30)
```

With `limit=5`, keyword search could return 15 candidates and semantic search another 15. Overlap meant that this was not necessarily 30 distinct passages.

The application combined the lists using **reciprocal rank fusion**, or RRF. Instead of directly adding keyword scores to vector scores with a different scale, RRF adds contributions based on ranking positions. A passage appearing high in both lists receives support from both. The rank constant controls how strongly position differences matter; the resulting score is not a probability that the answer is correct. [OpenSearch's RRF documentation](https://docs.opensearch.org/latest/vector-search/ai-search/hybrid-search/rrf/)

We also deduplicated identical passages while preserving their source references, then selected the final five.

**Five chunks does not mean five documents.** Several selected chunks might come from the same catalog. Conversely, a long catalog might contain far more chunks than one search returns.

The multiplier was a tuning choice: collect a broader pool than the final response needs. Raising it can change the selected evidence, but more candidates do not automatically produce a better answer.

## The Limit That Hid the Rows

After selection, the response formatter applied a second size limit:

| Stage | Maximum text per chunk |
| --- | ---: |
| Ingestion and storage | 3,000 characters |
| Tool response, before the fix | 2,000 characters |

A 2,800-character passage could rank highly and still lose its final 800 characters before Codex received it.

For prose, that might remove a qualification. For a procedure, it might remove the final verification step. For a table, it could remove entire entries or separate a test name from its status.

Consider this illustrative row near the end of a chunk:

```markdown
| checkout_health_check | Production | Every 5 minutes |
```

If the row appeared after character 2,000, the assistant could not use it from that response. Asking the model to be more thorough would not restore the missing text. Repeating the same search could return the same passage with the same cutoff.

The tool did mark shortened excerpts. That was useful honesty, but a truncation notice is not a substitute for the evidence it describes.

## A Small Fix Before a Larger Redesign

We aligned the response limit with the ingestion limit:

```python
# Before
MAX_EXCERPT_LENGTH = 2000

# After
MAX_EXCERPT_LENGTH = 3000
```

We left the default five results, maximum ten results, candidate policy, and ranking logic unchanged. That kept the experiment focused on the handoff rather than changing several retrieval settings at once.

Current-format chunks could now reach the assistant in full. Unexpected oversized or older chunks still received an explicit truncation notice. Markdown whitespace, tables, and code fences remained intact within the returned text.

These are **character limits, not token limits**. With five results, the maximum excerpt text increased from 10,000 to 15,000 characters per call, excluding metadata. Actual token usage depends on the text and tokenizer, so the larger allowance is a tradeoff, not a free improvement.

## Verify the Source, Not the Confidence

Boundary tests checked content below, at, and above 3,000 characters. Other tests covered Unicode, Markdown formatting, rows beyond the old cutoff, and code fences that must not absorb the next result's metadata.

We then checked real generated catalog chunks and repeated representative questions. In one catalog-listing test, the returned entries matched the source documentation exactly.

That was encouraging evidence for this case, not a benchmark proving complete retrieval for every question. The final answer alone also did not establish whether the assistant used one tool call or several.

I found it useful to separate three checks:

1. **Retrieval:** did we find the passages containing the expected information?
2. **Delivery:** did the tool return their text intact?
3. **Answering:** did the assistant include the relevant entries without inventing or misclassifying them?

A failure in one layer can resemble a failure in another. Inspecting the actual tool response made the difference visible.

## What I Would Improve Next

The fix removed an avoidable cutoff. It did not turn top-five search into exhaustive document reading.

For now, I would keep a small evaluation set: exact identifiers, paraphrased questions, long tables, procedures, and complete-list requests. Compare expected entries, irrelevant results, response size, and latency before increasing candidate or result counts.

I would also track how often excerpts are shortened. If ingestion changes its chunk size later, a regression test should catch another mismatch at the response boundary.

For workflows that genuinely require complete coverage, a future read capability could expand the selected section or document in ordered pages. That needs revision consistency and a way to detect missing content; it is not just a larger search limit. We deferred that design rather than treating it as necessary before testing the simpler fix.

As I argued in [Reliable RAG Starts Before the Language Model](/writing/reliable-rag-starts-before-the-language-model/), retrieval deserves its own engineering discipline. This issue added a more specific lesson:

**Check the evidence at the point where it reaches the model, not only where it was stored or retrieved.** Sometimes the missing rows are not a reasoning problem. They were removed before reasoning could begin.
