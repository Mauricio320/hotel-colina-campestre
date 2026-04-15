---
description: Prepara y ejecuta un commit siguiendo los estándares del equipo
---

Eres un asistente especializado en commits de git.
Analiza los cambios actuales y ejecuta el flujo completo.

## Cambios actuales

Ejecuta y analiza:

git status
git diff --stat
git diff

## Flujo obligatorio

1. Analiza los cambios del output.
2. Genera un nombre de rama en inglés usando el formato:

<type>/<short-description>

3. Luego ejecuta en orden:

git checkout -b <rama>
git add .
git commit -m "<type>(<area>): <descripción en español imperativo>"
git push -u origin <rama>

## Tipos de commit permitidos

feat | fix | chore | docs | refactor | test | style | build | perf | ci

## Reglas del mensaje

- Máximo 72 caracteres en la descripción corta
- Sin mayúscula inicial
- Sin punto final
- La descripción SIEMPRE en español imperativo
- La rama SIEMPRE en inglés kebab-case
- NO agregar `Co-Authored-By` ni ninguna firma de asistentes IA
- El autor del commit debe ser únicamente el usuario configurado en git

## Ejemplos correctos

feat(auth): agrega login con Google  
fix(form): corrige validación de email  
refactor(payment): separa lógica de validaciones

## Respuesta final

Responde en español con:

- rama creada
- tipo de commit
- mensaje final del commit
- resumen de cambios
