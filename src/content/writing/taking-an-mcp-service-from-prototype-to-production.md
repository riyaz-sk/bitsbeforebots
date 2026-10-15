---
title: "Taking an MCP Service from Prototype to Production"
description: "Lessons from building an MCP service: tested access controls, trustworthy evidence, deployment behavior, and operational ownership."
category: "AI engineering"
date: 2026-10-15
readingTime: "4 min"
---

Getting an AI assistant to call a tool is a useful milestone. It is not the same as delivering a service that other engineers can depend on.

While building an MCP service for operational investigation and technical knowledge retrieval, I found that much of the important work happened outside the tool functions themselves. Authentication, data quality, deployment behavior and troubleshooting all shaped whether the service was genuinely useful.

MCP provides a standard way for AI applications to discover and interact with tools and other sources of context. It does not decide which data your application should expose or how reliable the underlying systems must be. Those remain engineering responsibilities. [MCP architecture overview](https://modelcontextprotocol.io/docs/learn/architecture)

## Start With Boundaries

The first useful decision was to keep the tool surface small: retrieve relevant technical knowledge and retrieve operational evidence. Each capability had a clear purpose and bounded inputs.

That made the service easier to reason about. Instead of giving an assistant unrestricted access to a search backend, the service could validate the requested environment, constrain the time window and return a manageable amount of evidence.

I would make the same choice again. Begin with a specific workflow that people already struggle with. A narrow, dependable tool is a better foundation than a large collection of loosely defined capabilities.

## Authentication Is Insufficient

A successful login answers one question: has the caller authenticated? It does not establish that the caller should have access to every tool, document or environment behind the service.

I learned to test access from both directions. Verify that an authorized user can complete the workflow, but also verify that a user outside the intended access group cannot. An association in an identity-management screen is not a substitute for testing the actual enforcement behavior.

The service’s own backend identity needs similar care. If a tool only retrieves information, its credentials should not permit modifying or deleting that information. Read-only access still deserves scrutiny because reading sensitive data can itself cause harm. [MCP security guidance](https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices)

## Empty Is Ambiguous

One investigation started with an apparently simple problem: the tool returned no results, while the same records were visible through another interface.

Connectivity was working. Authentication was working. The backend returned a successful response. The problem was a query assumption that no longer matched the newer index mappings.

That changed how I interpret “no results.” It can mean nothing matched, but it can also mean the wrong environment, time field, schema or filter was used. Before telling a user that nothing happened, test the query against a known record and make the evidence window explicit.

## Replication Exposes Assumptions

Adding a second application replica introduces questions that are easy to overlook in a prototype. Can a session established through one replica continue through another? Which authentication records must be shared? What happens when credentials rotate or a process restarts?

Stateless request handling does not mean the application has no state. Authentication and client-registration state may still need shared storage, access controls and encryption.

Deployment deserves the same discipline. I found more confidence in inspecting the rendered configuration and testing the actual dependency versions than in assuming a valid configuration file would produce a working deployment.

## Observe the Workflow

Infrastructure health alone cannot tell you whether an MCP tool is useful. A healthy container can still return empty results, encounter backend failures or spend most of its time waiting on a dependency.

I separated tool-level activity from backend operations. One tool execution may perform several searches or credential lookups, so those counts answer different questions. Metrics show patterns, logs provide operational context, and traces help explain where time was spent. [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/)

Telemetry also needs failure handling. Bounded queues and retries can prevent a delivery problem from consuming unlimited resources, but they do not guarantee zero data loss. The service should continue operating when observability delivery fails, while making that failure visible.

## Protect Returned Evidence

Sanitizing application logs does not automatically sanitize tool responses. Retrieved documents, free-text errors and evidence links create a separate information boundary.

My recommendation is to minimize and inspect evidence before returning it to the AI client. Preserve what is needed for diagnosis, but handle credentials, personal information and token-bearing links deliberately. A final-answer instruction cannot undo sensitive information already sent to the model.

The lesson I took from this work is straightforward: an MCP service is still a production service. The protocol makes integration easier. Clear contracts, tested access controls, trustworthy evidence and operational ownership make it dependable.
