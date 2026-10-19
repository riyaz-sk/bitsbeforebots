---
title: "Reliable RAG Starts Before the Language Model"
description: "Reliable retrieval-augmented generation depends on corpus quality, hybrid retrieval, deduplication, evaluation, and clear information boundaries."
category: "AI engineering"
tags: ["RAG", "Hybrid Search", "Retrieval Quality", "Evaluation"]
date: 2026-10-15
readingTime: "4 min"
---

Retrieval-augmented generation sounds straightforward: find relevant information, provide it to a language model, and generate an answer.

That description is accurate enough to get started. It leaves out most of the engineering that makes the result dependable.

Working on a retrieval-backed engineering assistant taught me that answer quality often depends on decisions made before the model sees any text: what gets indexed, how passages are retrieved, how duplicates are handled, and what happens when retrieval is incomplete.

The original [RAG research](https://arxiv.org/abs/2005.11401) combines generation with retrieved knowledge. In an operational system, that retrieved knowledge deserves as much attention as the generation step.

## Treat the Corpus as a Product Dependency

An answer cannot be more current than the evidence available to it.

Documents need ownership, version information, and a predictable update path. Retrieved passages should retain enough context to explain where they came from: a document title, section, source reference, and version.

Chunking matters for the same reason. A passage that contains a recommendation but omits its prerequisites can be relevant and still be misleading.

The goal is not just to retrieve matching text. It is to retrieve enough evidence to support a useful answer.

## Use More Than One Retrieval Strategy

Engineering questions contain a mixture of exact identifiers and natural-language descriptions.

Someone might search for a specific error code. Another person might describe the same problem as “login succeeds, but the next request fails.”

Keyword retrieval is valuable for precise identifiers. Semantic retrieval can help when wording differs from the source material.

A hybrid approach gives both signals a role. One practical method is reciprocal rank fusion, which combines result positions rather than directly adding scores from different retrieval methods.

That is an architectural choice, not proof of better results. Its value still needs to be tested against representative questions.

## Remove Duplicates Without Losing Evidence

Combining retrievers can return the same passage more than once. Duplicate content wastes context and can make one source appear more strongly supported than it really is.

Deduplication should preserve provenance while preventing repeated copies from inflating a passage’s importance.

This distinction matters: multiple retrieval paths finding the same paragraph are not the same as multiple independent sources supporting a claim.

## Make Degraded Retrieval Visible

If semantic retrieval fails and keyword search still works, returning useful evidence may be preferable to failing the entire request.

But the system should record that it used a fallback. Otherwise, reduced retrieval coverage becomes invisible.

Empty results also need careful interpretation. They can mean no relevant content exists, but they can also indicate an incorrect filter, stale indexing, or a mismatch between the query and the index schema.

“No results” is an observation, not a diagnosis.

## Evaluate Retrieval and Answers Separately

A fluent answer can hide weak retrieval. A relevant passage can still lead to an unsupported conclusion.

A useful evaluation set should include exact identifiers, paraphrased questions, ambiguous requests, and questions the corpus cannot answer.

First ask whether retrieval found appropriate evidence. Then ask whether the answer stayed within that evidence and cited it accurately.

Citations make answers inspectable. They do not automatically make them correct.

## Respect the Information Boundary

Retrieved content reaches the model before it reaches the user. Access checks and data minimization therefore belong before that handoff, not only in final-answer formatting.

Sanitized application logs do not imply sanitized retrieval results. Those are separate data paths that need separate controls.

My main takeaway: **RAG is not just a model feature. It is a retrieval and data system with a language interface.** Reliable answers come from treating evidence, failure behavior, and information boundaries as first-class engineering concerns.
