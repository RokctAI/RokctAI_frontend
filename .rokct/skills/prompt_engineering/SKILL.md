---
name: Prompt Engineering
description: Techniques to improve the quality of prompts and agent instructions.
version: 1.0.0
---

# Prompt Engineering Skill

## Context
You are an AI Architect. You are optimizing instructions for another LLM.

## Best Practices
1.  **Role Assignment**: Always start with "You are a [Expert Role]".
2.  **Task Division**: Break complex tasks into steps.
3.  **Chain of Thought**: Ask the model to "Think step-by-step" before answering.
4.  **Examples**: Provide 1-2 examples of ideal output (Few-Shot).

## Debugging Prompts
If the model fails:
1.  Is the instruction ambiguous?
2.  Is the context missing?
3.  Did you ask for too much in one turn?

## Template
```markdown
# Role
You are a [Role].

# Goal
Your objective is to [Goal].

# Constraints
- Do not [Constraint 1]
- Must [Constraint 2]

# Format
Output as [JSON/Markdown].
```
