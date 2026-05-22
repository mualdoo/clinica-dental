export const DENTAL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 628 160" width="100%" height="100%">
  <style>
    /* Estilos de los dientes */
    .tooth-rect {
      fill: #ffffff;
      stroke: #cbd5e1; /* slate-300 */
      stroke-width: 2px;
      rx: 6px; /* bordes redondeados */
      transition: fill 0.2s ease, stroke 0.2s ease;
      cursor: pointer;
    }
    
    /* Efecto Hover */
    .tooth-rect:hover {
      fill: #e0f2fe; /* sky-100 */
      stroke: #38bdf8; /* sky-400 */
    }
    
    /* Estilos de los números (FDI) */
    .tooth-label {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 500;
      fill: #64748b; /* slate-500 */
      text-anchor: middle;
      pointer-events: none; /* Evita que el texto bloquee el hover del rectángulo */
    }
    
    /* Líneas divisorias de cuadrantes (Opcional, decorativo) */
    .divider {
      stroke: #e2e8f0; /* slate-200 */
      stroke-width: 2px;
      stroke-dasharray: 4;
    }
  </style>

  <!-- Línea divisoria central vertical -->
  <line x1="314" y1="10" x2="314" y2="150" class="divider" />
  <!-- Línea divisoria central horizontal -->
  <line x1="10" y1="80" x2="618" y2="80" class="divider" />

  <!-- ================= ARCADA SUPERIOR ================= -->
  
  <!-- Cuadrante 1 (Superior Derecho del paciente, Izquierda en pantalla) -->
  <g class="quadrant-1">
    <!-- Diente 18 -->
    <rect id="tooth_18" class="tooth-rect" x="20" y="20" width="32" height="48" />
    <text class="tooth-label" x="36" y="49">18</text>
    
    <!-- Diente 17 -->
    <rect id="tooth_17" class="tooth-rect" x="56" y="20" width="32" height="48" />
    <text class="tooth-label" x="72" y="49">17</text>
    
    <!-- Diente 16 -->
    <rect id="tooth_16" class="tooth-rect" x="92" y="20" width="32" height="48" />
    <text class="tooth-label" x="108" y="49">16</text>
    
    <!-- Diente 15 -->
    <rect id="tooth_15" class="tooth-rect" x="128" y="20" width="32" height="48" />
    <text class="tooth-label" x="144" y="49">15</text>
    
    <!-- Diente 14 -->
    <rect id="tooth_14" class="tooth-rect" x="164" y="20" width="32" height="48" />
    <text class="tooth-label" x="180" y="49">14</text>
    
    <!-- Diente 13 -->
    <rect id="tooth_13" class="tooth-rect" x="200" y="20" width="32" height="48" />
    <text class="tooth-label" x="216" y="49">13</text>
    
    <!-- Diente 12 -->
    <rect id="tooth_12" class="tooth-rect" x="236" y="20" width="32" height="48" />
    <text class="tooth-label" x="252" y="49">12</text>
    
    <!-- Diente 11 -->
    <rect id="tooth_11" class="tooth-rect" x="272" y="20" width="32" height="48" />
    <text class="tooth-label" x="288" y="49">11</text>
  </g>

  <!-- Cuadrante 2 (Superior Izquierdo del paciente, Derecha en pantalla) -->
  <g class="quadrant-2">
    <!-- Diente 21 -->
    <rect id="tooth_21" class="tooth-rect" x="324" y="20" width="32" height="48" />
    <text class="tooth-label" x="340" y="49">21</text>
    
    <!-- Diente 22 -->
    <rect id="tooth_22" class="tooth-rect" x="360" y="20" width="32" height="48" />
    <text class="tooth-label" x="376" y="49">22</text>
    
    <!-- Diente 23 -->
    <rect id="tooth_23" class="tooth-rect" x="396" y="20" width="32" height="48" />
    <text class="tooth-label" x="412" y="49">23</text>
    
    <!-- Diente 24 -->
    <rect id="tooth_24" class="tooth-rect" x="432" y="20" width="32" height="48" />
    <text class="tooth-label" x="448" y="49">24</text>
    
    <!-- Diente 25 -->
    <rect id="tooth_25" class="tooth-rect" x="468" y="20" width="32" height="48" />
    <text class="tooth-label" x="484" y="49">25</text>
    
    <!-- Diente 26 -->
    <rect id="tooth_26" class="tooth-rect" x="504" y="20" width="32" height="48" />
    <text class="tooth-label" x="520" y="49">26</text>
    
    <!-- Diente 27 -->
    <rect id="tooth_27" class="tooth-rect" x="540" y="20" width="32" height="48" />
    <text class="tooth-label" x="556" y="49">27</text>
    
    <!-- Diente 28 -->
    <rect id="tooth_28" class="tooth-rect" x="576" y="20" width="32" height="48" />
    <text class="tooth-label" x="592" y="49">28</text>
  </g>

  <!-- ================= ARCADA INFERIOR ================= -->
  
  <!-- Cuadrante 4 (Inferior Derecho del paciente, Izquierda en pantalla) -->
  <g class="quadrant-4">
    <!-- Diente 48 -->
    <rect id="tooth_48" class="tooth-rect" x="20" y="92" width="32" height="48" />
    <text class="tooth-label" x="36" y="121">48</text>
    
    <!-- Diente 47 -->
    <rect id="tooth_47" class="tooth-rect" x="56" y="92" width="32" height="48" />
    <text class="tooth-label" x="72" y="121">47</text>
    
    <!-- Diente 46 -->
    <rect id="tooth_46" class="tooth-rect" x="92" y="92" width="32" height="48" />
    <text class="tooth-label" x="108" y="121">46</text>
    
    <!-- Diente 45 -->
    <rect id="tooth_45" class="tooth-rect" x="128" y="92" width="32" height="48" />
    <text class="tooth-label" x="144" y="121">45</text>
    
    <!-- Diente 44 -->
    <rect id="tooth_44" class="tooth-rect" x="164" y="92" width="32" height="48" />
    <text class="tooth-label" x="180" y="121">44</text>
    
    <!-- Diente 43 -->
    <rect id="tooth_43" class="tooth-rect" x="200" y="92" width="32" height="48" />
    <text class="tooth-label" x="216" y="121">43</text>
    
    <!-- Diente 42 -->
    <rect id="tooth_42" class="tooth-rect" x="236" y="92" width="32" height="48" />
    <text class="tooth-label" x="252" y="121">42</text>
    
    <!-- Diente 41 -->
    <rect id="tooth_41" class="tooth-rect" x="272" y="92" width="32" height="48" />
    <text class="tooth-label" x="288" y="121">41</text>
  </g>

  <!-- Cuadrante 3 (Inferior Izquierdo del paciente, Derecha en pantalla) -->
  <g class="quadrant-3">
    <!-- Diente 31 -->
    <rect id="tooth_31" class="tooth-rect" x="324" y="92" width="32" height="48" />
    <text class="tooth-label" x="340" y="121">31</text>
    
    <!-- Diente 32 -->
    <rect id="tooth_32" class="tooth-rect" x="360" y="92" width="32" height="48" />
    <text class="tooth-label" x="376" y="121">32</text>
    
    <!-- Diente 33 -->
    <rect id="tooth_33" class="tooth-rect" x="396" y="92" width="32" height="48" />
    <text class="tooth-label" x="412" y="121">33</text>
    
    <!-- Diente 34 -->
    <rect id="tooth_34" class="tooth-rect" x="432" y="92" width="32" height="48" />
    <text class="tooth-label" x="448" y="121">34</text>
    
    <!-- Diente 35 -->
    <rect id="tooth_35" class="tooth-rect" x="468" y="92" width="32" height="48" />
    <text class="tooth-label" x="484" y="121">35</text>
    
    <!-- Diente 36 -->
    <rect id="tooth_36" class="tooth-rect" x="504" y="92" width="32" height="48" />
    <text class="tooth-label" x="520" y="121">36</text>
    
    <!-- Diente 37 -->
    <rect id="tooth_37" class="tooth-rect" x="540" y="92" width="32" height="48" />
    <text class="tooth-label" x="556" y="121">37</text>
    
    <!-- Diente 38 -->
    <rect id="tooth_38" class="tooth-rect" x="576" y="92" width="32" height="48" />
    <text class="tooth-label" x="592" y="121">38</text>
  </g>
</svg>
`

export const DENTAL_SVG_BUENO = `
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="534" height="820" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 534 820"><path fill="#ffffff" stroke="#000000" stroke-width="2" d="m236.5 40 13.5 1.5-15.5.5-20.5 7q-1.2 3 2.5 2l2-2 9-3h4l3-2q12.1 1.6 20-1v1l-1.5.5 3.5 1.5 3.5 1.5q2.7 3.3 2 10l-2 6v5l-2 3-3 12q-2.1 7.4-7.5 11.5l-3 2-9 1-4.5-1q1.3-3-2.5-2-17.4-11.6-20.5-37.5l3.5-5.5 2.5-.5-2-.5 3.5-5q3-3 9-3l2-2h9l1-1ZM235 50q-2 3-7 1l-6 3-1 2 14-4h8l1 1 4-1-13-2ZM288.5 40l15 1 14.5 7 1 2.5-2 1 3 .5 3 8.5q-2.2 1.2-1 6l-2 2v3l-5 8V82h-2v3q-2.7-1.1-2 1.5L298.5 97l-8 1-5-1-4.5-3.5-5-9-5-15q.6-6.1-2-9v-10l3.5-4.5 6.5-1.5-3-1 4-.5.5-2h7l1-1Zm-5.5 2-3 2h15l18 5 2 2q3 1 2-2l-9-4-8-1-4-2h-13Zm7 8-7 2 5 1 3-2 6 2 10 1 2 2h2l-7-5-14-1ZM193.5 57q6.4.7 8.5 5.5l5 13 1 17-3 9.5-3.5 2h-7l-19-11L165 82.5l-2-7 4.5-5.5 3-2q8.5-8.5 23-11Zm-8.5 7q-8 2-12 8l1 1q5-6 14-7 1-3-3-2ZM336.5 57l12 3 9.5 5q-1.1 2.7 1.5 2l7.5 6.5 1 4q-3.6 9.4-11.5 14.5l-20 12h-7l-4.5-3.5-3-13 1-1 1-13 5-12 2.5-2.5 5-2Zm7.5 7 1 2 12 7q2 1 1-1-5-6-14-8ZM178.5 58l2.5.5-2.5.5v-1ZM170 63l2 .5-4 3q-.7-2.6 2-1.5v-2ZM140.5 77l11 2 10.5 8.5 7 12 2 8v13l-6.5 7.5h-16q-2-3-8-2l-12-5-5.5-5.5-3-6-1-9 4-13.5q2.7 1.1 2-1.5l6.5-5.5 9-3Zm5.5 6-5 2-3 4 9-4h4l-5-2Zm-17 15-3 5v8l2 1v-8l2-2-1-4ZM386.5 77q13.7.3 19.5 8.5l5 10v14l-7.5 10.5-5 3-17 5h-15l-6.5-6.5v-15q3.4-17.1 15.5-25.5l11-4Zm-2.5 6-3 2 12 4-2-4-7-2Zm18 15 1 14h1q2-11-2-14ZM112.5 123h6l5 2 12.5 10.5 2 4.5q2.7-1.1 2 1.5l7 10v8l-8.5 11.5q-6.7 2.3-17 1-1.5-2.5-7-1l-13-5-10.5-9.5-2-4-1-11 4-9.5h2q-1.1-2.7 1.5-2l8-5 9-2Zm5.5 13-1 2 6 4q1 4-1 3-7 3-6 12l-5-1-3 2q2 2 7 1l7 4-2-4h-2l-1-2q1-9 8-12 5-1 7 2h3q-10-4-17-11ZM413.5 123h6q2.3 2.7 8 2l11.5 8.5 3 5 1 8-3 10.5q-2.7-1.1-2 1.5l-7.5 6.5-14 6-20 1-7.5-3v-2q-2.7 1.1-2-1.5l-3-5q1.3-4.7-1-6l6-12.5q2.7 1.1 2-1.5l8-10.5 7.5-5 7-2Zm.5 12-1 2-15 8-1 2q4 1 5-2h5l2 4h2q3 3 2 10l-5 2 1 3 8-5 5-1q2 1 1-2-3 2-9 1l1-2q-1-7-5-10-3 1-2-2l6-5v-3ZM85.5 169h9l7 2 9.5 7 1.5 3q2.3-.7 1.5 1.5 6.8 4.2 10 12v12l-3 5.5-5.5 3-17 1q-1.7-2.8-8-1l-6-3h-3L70 203.5l-2-3-3-5-1-7q2.3-1.2 1-6l6.5-7.5 9-5 5-1Zm6.5 11v3l7 7h-1l-6 10q-2-2-7-1l-1 2 2-1 12 4 1 1-4-5q1-7 6-10l4 2 3-1q-9-3-14-9 1-3-2-2ZM435.5 169h10l8.5 2q-1.2 3 2.5 2l9.5 10.5v11l-6 10.5-11.5 7-9 3-18 1-9-2-4.5-4.5-2-4v-9l2-4 3-5.5q2.7 1.1 2-1.5l10.5-10.5h1.5q-1.2-3 2.5-2l8-4Zm1.5 11v2q-4 6-13 8l1 2 4-1 1-1 5 6v6q-4-2-3 2v1l5-3 10-2-10-1v-3l-5-7 3-2 4-6-2-1ZM62.5 216h14l10 3 17.5 12 5 6.5 3 7v14q-5.6 16.1-15 27.5l-5.5 3-8 1q-1.2-2.3-6-1-10.8-7.7-25-12l-8.5-7.5-2-8 2-9 5-9v-11q2.8-1.7 2-7l5.5-6.5 6-3Zm20.5 9 2 7v8l1 1q-6 3-8 11-5 1-7-2h-5l-3-2-5 1 7 3 12 1q2 1 0 3l2 13-4 4-6 3q-5 1-6-2-3 1-2-1l-2 1q3 4 10 6v-1l8-5 3-5 5 2 3-1-4-1-4-4q1-5-1-6l1-8 2-3 6-5 4-5-5 1v-8l-1-1 2-3-5-2Zm7 46v1h2l-2-1ZM454.5 216h13l9.5 5 4 9.5v12l7 14v11l-5.5 6.5-29 15-9 1-5-1-5.5-3v-2q-2.7 1.1-2-1.5-3.7-1.2-3-5.5-3 1.3-2-2.5l-4-5-3-10-2-2v-12l5-10.5q2.7 1.1 2-1.5l5-4q-.7-2.2 1.5-1.5 2.5-4.5 7.5-5-1.2-3 2.5-2l13-5Zm-5.5 8-5 2 1 3q-2 1-1 6v4q-4-2-3 2l6 5q-1 2 2 1l2 7-1 12q-1 4-6 3l-2 3 3-2 1 1 4-2 9 7 3 4 4-1 3-3q2 1 1-1l1-2-6 3h-3l-6-4q-3 1-2-2l-3-1 3-10-1-4 2-2 12-1 8-4v-1q-6 0-8 3h-6l-2 2h-6l-2-3v-3q-3 1-2-1l-3-2-1-2 1-11 3-4v-2Zm-9 12-1 3h2l-1-3ZM49.5 287l12 1q3 3 9 3l2 2h3l6 3 6.5 5.5 4 8v6l-2 4v9q-2.6 2.9-2 9l-3 6.5h-2q1.1 2.7-1.5 2l-4 3h-18l-3-2-12-3-8.5-5.5-2-3v-13q4-8 2-22 1.5-6.9 6.5-10.5l7-3Zm15.5 9v2l4 2 1 3 3-2-8-5Zm6 8-1 6-7 10q-3-1-4 2-8 2-9-2l-3 1q4 5 14 3-1 3 2 5v2q3-1 2 2l-8 5v1q5 0 7-3h5l2-2h6l-2-2-7 1-5-7v-3q6-5 8-12v-7Zm-21 35v2q4-1 7 2l1-2h-2v-2h-6ZM475.5 287l10 1 4.5 3 5 10.5v18q3.4 5.1 2 15l-2 4.5-14.5 7-10 3q-7.5-1.5-11 1-1.5-2.5-7-1l-6.5-5.5-4-8-1-13-2-5v-10l8.5-10.5 13-6 6-1 2-2q5.5 1.5 7-1Zm-10.5 9-5 3q-3 2 0 3l6-4q1-3-1-2Zm-6 9v5l2 2 1 5 6 6-4 10-3-1q-8-1-7 2l13 2 5 3h2l-8-5q-1-4 2-3v-3l2-4h9l2-2q3 1 2-2l-4 2q-8 1-10-2l-8-10q2-6-2-5Zm15 34v3l7-1v-2h-7ZM42.5 351h11q2.9 2.6 9 2 .7 2.8 5 2l6.5 5.5q3.3 3.2 3 10-2.5 1.5-1 7l-5 14v4l-2 3.5-10.5 5-14 1-1-1h-10l-9.5-6.5q-3.6-2.9-2-11l2-3 1-11-1-5q1.5-8.5 7.5-12.5l11-4Zm11.5 8v2l3 1 4-1-7-2Zm2 8-4 10-5 3h-8l-1 2h10l1-1 2 1 5-8v-7Zm-22 12v1h3l-3-1Zm17 4-2 2v6l-2 2-1 5 4 1q3 1 2-2l-3-1 2-4v-5l8 2 4-2h3q-1-3 2-2v-1l-7 2h-8l-2-3ZM478.5 351h10l7 2 6.5 4.5q4.1 4.9 5 13-2.7 1.7-1 8 2.3 1.3 1 6l2 3v5l-7.5 9.5-4 2-15 1-1-1h-10l-10.5-6.5-3-12-2-3v-4l-2-2v-12l6.5-7.5 8-4 10-2Zm-5.5 8-2 1 1 2q4 1 5-2l-4-1Zm3 8q-3 10 4 15 1 3-1 4-9 1-14-2l-3 1 8 3 9-1 2 6q2 5-1 4l-1 2 6-1-4-12v-4h12v-2l-11-1q-6-3-6-12Zm20 12v1h2l-2-1ZM44.5 466h16q1.4 2.6 6 2l7.5 5.5 4 8v8l5 13v8l-6.5 8.5-12 7q-5.7-.7-8 2h-15l-9.5-6.5-3-11v-10l-4-11v-6l4-8 5.5-5.5 10-4Zm3.5 7 2 3 3-1q1-4-5-2Zm2 6-1 9 6 8 1 4-3-1-12 1h7l8 3 3 9 2 1q0-8-4-11l1-6 3 1 9-2v-1l-5 1-9-2-5-5q1-7-1-9Zm11 36-2 1-2 3q5 1 6-2l-2-2ZM471.5 466h16q.8 2.7 5 2l9.5 7.5 3 7v9l-3 7v9l-2 11-5.5 6.5-6 3h-15l-12-4-8.5-5v-2q-2.7 1.1-2-1.5-4.5-3.5-3-13l1-5 2-2 3-17 6.5-8.5h2.5l.5-2h4l4-2Zm6.5 7q-1 3 2 2l1 2v-2l3-1-6-1Zm3 5-1 9-2 4-2 2-10 2 1 2 5-1 2 5-4 8 1 5 2-8 9-6h7v-1q-10-1-14 1-1-5 3-6-1-3 2-2-1-3 2-4l-1-10Zm-21 16v1h5l-5-1Zm11 21-4 2q2 3 8 2l-1-2-3-2ZM69.5 530q16.3.2 22.5 10.5l5 9 3 11 4 6 1 11q-1.4 6.1-6.5 8.5l-12 7-11 3h-12l-7.5-4-15-27.5-2-9v-2l4-9 7.5-7.5 7-4 12-3Zm-1.5 6-2 2 3 1 3-2-4-1Zm3 5-3 6-6 3q-6-2-5 2l12-2 2-5v-4Zm0 10-1 2 6 8q1 6-1 8l-9 4v1q7 1 10-3l6 10v4l-3 3 2 1 5-3-3-2v-6l-6-8 2-6q8 2 12-2v-1l-11 1-9-11ZM455.5 530h6l4 2 7 1q8.4 3.1 13.5 9.5-.7 2.6 2 1.5v2.5l2 2 1 11-3 9q-5.2 4.8-7 13l-9.5 12.5-4 2h-13l-15-5-12.5-10.5q-3.4-2.6-2-10l2-2v-3l2-2 8-21 5.5-6.5 6-4 7-2Zm3.5 6 2 3 3-1v-2h-5Zm2 5-2 2 2 1v-3Zm1 3-2 2 1 3 8 3 5-1-11-3-1-4Zm-3 8-2 2q-1 2 2 1l1-2-1-1Zm-2 3-5 6q-2 6 1 8 1 3-2 2l-4 8v5l-3 2 5 2h3l-3-2v-6l6-9 6 3h4l-7-4-4-3v-5l3-4v-3Zm-16 6 3 3q5 1 7-1l-10-2Zm25 13v2h4l-4-2ZM86.5 597h15l9 3 6.5 6.5 6 11 5 14 1 18-1 3.5q-2.7-1.1-2 1.5l-12.5 8.5h-3l-2 2-13 5h-7q-1.4-2.6-6-2l-9.5-8.5q-6.5-7.5-10-18v-22q2.7-2.3 2-8l5-7.5 9.5-5 7-2Zm5.5 8-5 3h5v9l-2 2-5-2q-7-2-6 2h6l9 5q7 6 8 19v-7l2-2 12-1 2-3-14 3-5-6-7-6 2-5v-8l2-2-4-1Zm-2 38-4 2v1l4-1q9-1 13 2l3 5 2 1-2-5q-4-7-16-5Zm18 12-2 2q-3-1-2 2l9-3-5-1ZM429.5 597h15l9 3 10.5 8.5 4 17v13l-4 12-11.5 14.5-9 5h-8l-24-10-8.5-7.5q-3.8-4.7-2-15l7-21 7-12.5h2q-1.1-2.7 1.5-2l2-2 9-3Zm5.5 7-1 2 3 1v10l2 3-3 2-6 7q1 3-2 2v2l-14-3-1 2 6 2h9v5h2v-5l6-10 12-5q4 1 3-2l-9 2-3-3q1-5-1-6l5-2-8-4Zm-5 37-1 3-2 1-4 5v2q3 1 2-1l7-6h10l1 1h3l-4-3h-12v-2Zm-11 14 1 2 5 2q3 1 2-2l-3-2h-5ZM116.5 667h7q1.7 2.8 7 2l9.5 7.5q3.9 4.1 3 13l-3 9-4 5.5-14.5 7h-17q-8.5-1.5-12.5-7.5-5.2-4.7-3-17l7-10.5 12.5-7q6 1 8-2Zm.5 7-6 5h-2l1 2 7-4h3v-1l-3-2Zm3 3q-1 3 2 2l4 7q-1 8 1 11l-7 4 1 2q3-4 8-4l-1-2v-11l-1-1 3-6q2 1 1-2-4-1-5 3-2-4-6-3ZM407.5 667h7q2 3 8 2l12.5 7 7 11.5v11l-5.5 7.5-9 5h-18q-11.8-2.2-17.5-10.5l-5-14q2.7-2.3 2-8l3.5-4.5 3-2 4-3q5.7.7 8-2Zm6.5 7-2 3 9 4 2-1-9-6Zm-14 3q-1 3 2 2l1 3-1 5 1 3q2 7-2 9l10 4h1l-8-6q-1-11 4-16-1-3 3-2v-2q-4-1-5 3-2-4-6-3ZM133.5 712h17l6.5 4.5q3 4 2 12l-2 3v4l-2 5-5 8.5-8.5 4-8 1-10-3-8.5-7.5q-4-5-2-16l8.5-10.5 12-5Zm4.5 5-1 2-9 5v1q6 0 9-3 4-1 6 2l6 8-4 6q-1 3 2 2l5-6-3-6q-2-6-9-7l-2-4ZM380.5 712h17l8 3 8.5 6.5 4 6v12l-7.5 9.5-13 5h-5l-11.5-5-4-5.5-5-13v-11l3.5-4.5 5-3Zm13.5 6-2 4 8 3h3l-9-7Zm-4 3-4 2-5 8-2 1 3 5q-1 2 2 1v2h2l-4-6v-3l4-6 5-2q1-3-1-2ZM350.5 742l10 2 14.5 7q-1.1 2.7 1.5 2l1.5 3q2.7-1.1 2 1.5 3.7 2.2 3 9l-1 5-6.5 8.5q-5.7 3.8-15 4-1.5-2.5-7-1l-5.5-4.5q-6.4-10.1-4-29l1-4 2.5-2.5 3-1Zm24.5 21v2l-6 6-12 6v1q8-1 13-5l7-8q1-3-2-2ZM173.5 743h10l1.5 1.5 2 9v9l-1 1v8l-5.5 9.5-4 2-9 1-9-2-7.5-6.5-4-10 2-7 7.5-7.5q6.8-5.7 17-8ZM155 764l-1 2q6 9 18 12h3l-8-5q-4 1-3-2l-9-7ZM211.5 758h4l3.5 2 5 12.5v15l-3 9.5-6.5 1-18-4-8.5-6.5v-6q2.7-1.1 2-4.5 2.7 1.1 2-1.5l5-7.5 14.5-10ZM197 787l1 2 10 4h4l-3-3-12-3ZM315.5 758q5.7-.7 8 2l11.5 10.5 2 3 5 7v8l-3.5 3.5h-3l-2 2-9 3-12 1-3.5-2.5q-3.9-9.1-2-24l3-9 3.5-3.5 2-1Zm16.5 29-11 4-1 2 7-1 7-3q1-3-2-2ZM245.5 762h4l5.5 5.5 5 11 2 8v6l-4.5 6.5h-22l-4.5-2q-1.9-2.7-1-9.5l3-11 7-11.5 5.5-3Zm-7.5 30v2l6 1q5 2 7-1 5 2 4-2l-5 1-12-1ZM281.5 762q8.1-.1 10.5 5.5l2 4.5q3-1.2 2 2.5l3 6 2 13-3.5 4.5-2 1h-22l-4.5-4.5v-11l5-13 7.5-8.5Zm-5.5 30v2l6 1q5 2 7-1 5 2 4-2l-6 1-11-1ZM192.5 794l12 5 10.5.5q-3.4 2.6-10.5 1.5l-7-2-5-5ZM336.5 794l2.5.5-2 .5q1.1 2.7-1.5 2-5.3 5.2-17 4l-3.5-1.5q14.4.9 21.5-5.5ZM237.5 801l5.5.5-5.5.5v-1ZM249.5 801l5.5.5-5.5.5v-1ZM275.5 801l6.5.5-6.5.5v-1ZM287.5 801l5.5.5-5.5.5v-1Z"/></svg>
`
