---
marp: true
theme: gaia
class: lead
paginate: true
backgroundColor: #fdfdfd
---

# Aula2-11: Introdução à dinâmica e primeira lei de Newton

---


---

### Força

<p>Trata-se de uma interação entre entes físicos capaz de acelerá-los, deformá-los ou equilibrá-los.</p>
<p> </p>
<p>Na primeira das imagens temos um morteiro. O míssel, quando liberado à beira do tubo, percorre-o até o fundo, onde aciona um pino que desencadeia uma explosão. Neste instante, gases se expandirão e empurrarão o projétil, acelerando-o para fora do tubo. Na segunda imagem, uma prensa hidráulica esmaga um objeto de plástico, deformando-o. De último, temos uma imagem de uma gangorra com pedras; neste sistema, forças agem para cima e para baixo de modo a equilibrar as pedras</p>
<p> </p>
<table>
<tbody>
<tr>
<th style="width: 26%;"> </th>
<th style="width: 34%;"> </th>
<th style="width: 40%;"> </th>
</tr>
<tr>
<td>
<p style="text-align: center;"><img alt="animação de um morteiro disparando um projétil" src="https://webfisica.com/imagens-fisica/aulas/aula2-11/a.gif" style="width: 90%;"/></p>
</td>
<td>
<p style="text-align: center;"><img alt="animação de uma prensa hidráulica amassando uma lixeira" src="https://webfisica.com/imagens-fisica/aulas/aula2-11/b.gif" style="width: 90%;"/></p>
</td>
<td>
<p style="text-align: center;"><img alt="gangorra de pedras em equilíbrio mecânico" src="https://webfisica.com/imagens-fisica/aulas/aula2-11/c.gif" style="width: 90%;"/></p>
</td>
</tr>
<tr></tr>
</tbody>
</table>
<p> </p>
<p>A força é uma grandeza vetorial, isto é, para ser satisfatoriamente representada, necessita de três informações. São elas: Direção, sentido e intensidade. Tais valores são integralmente informados pela representação vetorial. A intensidade deste vetor será medida, no SI, em newtons<em>. Veja o exemplo abaixo:</em></p>
<p><em><em> <br/></em></em></p>
<table>
<tbody>
<tr>
<th style="width: 60%;"> </th>
<th> </th>
</tr>
<tr>
<td>
<p style="text-align: center;"><img alt="dois homens fazem força sobre uma corda, as forças estão representadas por vetores" src="https://webfisica.com/imagens-fisica/aulas/aula2-11/exx.png" style="width: 90%;"/></p>
</td>
<td style="vertical-align: super;">
<p>Estão representadas algumas das forças que agem sobre a corda. Observe que as forças exercidas são ambas horizontais e de igual intensidade ou magnitide, divergindo, então, apenas pelo sentido.</p>
</td>
</tr>
<tr></tr>
</tbody>
</table>
<p><em><em><br/><br/></em></em></p>
<table class="tab_din">
<tbody>
<tr>
<th class="c1"> </th>
<th> </th>
</tr>
<tr>
<td colspan="2">
<h3>Principais forças da dinâmica</h3>
<h3> </h3>
</td>
</tr>
<tr>
<td>
<p><strong>Peso:</strong> Força de origem gravitacional, de ação à distância. Esta força é dada pela seguinte fórmula:</p>
<br/>
<p><img class="formula" src="https://latex.codecogs.com/gif.latex?\dpi{60}&amp;space;\huge&amp;space;\vec&amp;space;P&amp;space;=&amp;space;m&amp;space;\vec&amp;space;g"/></p>
</td>
<td><img alt="A Terra atraindo a lua" src="https://webfisica.com/imagens-fisica/aulas/aula2-11/tb1.png" style="width: 200px;"/></td>
</tr>
<tr>
<td>
<p><strong> Força de atrito estático e dinâmico:</strong> Força proveniente da rugosidade existente entre duas superfícies potencialmente deslizantes entre si. Chamamos força de atrito estático, essa força, antes do deslizamento; chamamos de atrito dinâmico a força durante ele.</p>
<br/>
<p><img class="formula" src="https://latex.codecogs.com/gif.latex?\dpi{60}&amp;space;\huge&amp;space;\vec&amp;space;F_a_e&amp;space;=&amp;space;\mu_a_e&amp;space;.&amp;space;\vec&amp;space;N"/></p>
</td>
<td><img alt="dois corpos se atritando" src="https://webfisica.com/imagens-fisica/aulas/aula2-11/tb2.png" style="width: 200px;"/></td>
</tr>
<tr>
<td>
<p><strong>Normal:</strong> Força exercida por uma superfície em um corpo que a impinge, também, uma força.</p>
<br/>
<p><img class="formula" src="https://latex.codecogs.com/gif.latex?\dpi{60}&amp;space;\huge&amp;space;\vec&amp;space;N"/></p>
</td>
<td><img alt="Caixa sobre plano inclinado" src="https://webfisica.com/imagens-fisica/aulas/aula2-11/tb3.png" style="width: 150px;"/></td>
</tr>
<tr>
<td>
<p><strong>Tensão:</strong> Força exercida por cordas, cabos, corrente e similares.</p>
<br/>
<p><img class="formula" src="https://latex.codecogs.com/gif.latex?\dpi{60}&amp;space;\huge&amp;space;\vec&amp;space;T"/></p>
</td>
<td><img alt="corda puxando caixa" src="https://webfisica.com/imagens-fisica/aulas/aula2-11/tb4.png" style="width: 200px;"/></td>
</tr>
</tbody>
</table>

---

### Força resultante

<div class="externa">
<div class="interna_esq" style="width: 40%;"><img alt="soma de vetores em um problema de dinamica" src="https://webfisica.com/imagens-fisica/aulas/aula2-11/red.png"/></div>
<p>Raramente um corpo está submetido a ação de apenas uma força, segue-se, daí, a necessidade de trabalharmos com a <em>força resultante</em>.</p>
<br/>
<p>A força resultante é a força que resulta da soma vetorial de todas as forças que agem sobre o corpo estudado.</p>
<p><img class="formula" src="https://latex.codecogs.com/gif.latex?\dpi{80}&amp;space;\huge&amp;space;\vec F_{r}=\sum_{i=1}^{n}&amp;space;\vec F_i"/></p>
</div>
<p> </p>
<p>Na imagem acima, ilustramos apenas as forças que agem sobre a pedra horizontal, a soma vetorial destas forças, neste caso, como podemos observar, resulta em 0 N.</p>
<p><br/><br/></p>
<div class="row-deg"> </div>
<p> </p>

---

### Primeira lei de Newton (princípio da inércia)

<p>É empreendimento árduo rastrear o nome do primeiro cientista a conceber com a correção e a abrangência necessárias o princípio da inércia. Sabemos que o filósofo medieval francês Jean Buridan (★ 1301 <strong>—</strong> 1358 ✝) empenhou-se em formular uma competende descrição da natureza que muito se assemelhava a hoje conhecida primeira lei de Newton. Mais tarde, Leonardo Da Vinci (★ 1452 <strong>—</strong> 1519 ✝) também dedicou-se numa formulação rudimentar disto que estamos a tratar. Ainda mais adiante, Galileu Galilei (★ 1564 <strong>—</strong> 1642 ✝) versou sobre o mesmo princípio, tratando-o com mais rigor e, por conseguinte, dando-lhe maior credibilidade. O contemporâneo de Galileu e prestigiado filósofo, cientista e matemático René Descartes (★ 1564 <strong>—</strong> 1642 ✝) também produziu formulações acerca do mesmo tema. Em 1687, Isaac Newton (★ 1642 <strong>—</strong> 1727 ✝) publica o livro <em>Princípios Matemáticos da Filosofia Natural</em>. Neste livro, são apresentadas as três leis de Newton, dentre elas o princípio da inércia; a lei da gravitação universal e mais uma vastidão de teoremas matemáticos. O prestígio de Newton e o rigor matemático e filosófico a que ele costumeiramente emprestava a suas formulações acabaram por conceder-lhe a fama de progenitor de tal princípio, batizando o princípio da inércia de, também, primeira lei de Newton.</p>
<p style="text-align: center;"><img alt="cientistas que pensaram sobre a lei da inercia antes de Newton" src="https://webfisica.com/imagens-fisica/aulas/aula2-11/hist.png" style="width: 100%;"/></p>
<p> </p>
<p>O fenômeno:</p>
<p>Todo corpo que possui massa naturalmente tende a resistir à alterações em sua velocidade. A grandeza que indica essa oposição a mudança de velocidade é chamada massa inercial. Em outras palavras, podemos afirmar que um corpo nunca tem a sua velocidade alterada espontaneamente. Pois para que isso ocorra – para que sua velocidade se altere –, é necessário que uma força externa resultante aja sobre ele.</p>
<p> </p>
<p>O enunciado:</p>
<p class="formula_imp"><em>Um corpo que está parado permanecerá parado, um corpo que está em movimento retilíneo uniforme permanecerá nesse movimento na ausência de forças resultantes agindo sobre ele.</em></p>
<table>
<tbody>
<tr>
<th style="width: 65%;"> </th>
<th style="width: 35%;"> </th>
</tr>
<tr>
<td>
<p style="text-align: center;"><img alt="Animação de um carro colidindo contra uma parede" src="https://webfisica.com/imagens-fisica/aulas/aula2-11/pri.gif" style="width: 95%;"/></p>
</td>
<td>
<p style="text-align: center;"><img alt="Experimento de inercia com um ovo" src="https://webfisica.com/imagens-fisica/aulas/aula2-11/pri2.gif" style="width: 90%;"/></p>
</td>
</tr>
<tr></tr>
</tbody>
</table>
<p><br/><br/></p>
<div class="row-deg"> </div>
<p> </p>

---

### Pseudoforças

<div class="externa">
<div class="interna_esq" style="width: 30%;"><img alt="Carro freiando e objeto que estava sobre ele sendo arremeçado para frente" src="https://webfisica.com/imagens-fisica/aulas/aula2-11/pseudo.png"/></div>
<p>Na imagem ao lado, o carro freia, reduzindo a sua velocidade, o eletrodoméstico mantém a sua velocidade (lei da inercia). A impressão é a de que o eletrodoméstico foi arremessado para frente por uma força estranha. Pois bem, esta força, na verdade, não existe; entretanto, há quem se refira a esta impressão de força como sendo uma força fictícia, uma força de "mentira" ou, então, uma força inercial.</p>
</div>
