Transcript

```bash
http "http://localhost:4747/transcript?url=https://www.youtube.com/watch?v=0VLAoVGf_74&t=133s"
```

Translate

```bash
echo '{"text": "hello world"}' | http "http://localhost:4747/translate?lang=Spanish"
```

Build questions

```bash
echo '{"text": "En enero de 2025, la empresa china Deep Seek sorprendió al mundo con el lanzamiento de R1, un modelo de lenguaje altamente competitivo que requiere solo una fracción del poder de cómputo de otros modelos líderes. Quizás aún más sorprendente es que, a diferencia de la mayoría de sus homólogos estadounidenses, Deep Seek ha publicado abiertamente los pesos del modelo R1, el código de inferencia y extensos informes técnicos, publicando un promedio de un informe por mes en 2024 y detallando muchas de las innovaciones que culminaron dramáticamente en el lanzamiento de R1 a principios de 2025."}' | http "http://localhost:4747/build_questions?count=5"
```

Check answer

```bash
echo '{}' | http POST "http://localhost:4747/check_answer" 
```