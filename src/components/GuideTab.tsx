import React, { useState } from 'react';
import { SPECIES_PRESETS } from '../data/species';
import { AlertCircle, CheckCircle, Flashlight, HelpCircle, Info, Sparkles, XCircle } from 'lucide-react';

export const GuideTab: React.FC = () => {
  const [screenLightActive, setScreenLightActive] = useState(false);

  return (
    <div className="p-4 space-y-5 pb-24 max-w-md mx-auto">
      {/* Tela Ovoscópio Cheio se ativado */}
      {screenLightActive && (
        <div
          onClick={() => setScreenLightActive(false)}
          className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 cursor-pointer select-none"
        >
          <div className="w-36 h-36 rounded-full bg-amber-100 border-8 border-amber-300 shadow-[0_0_90px_rgba(255,200,100,0.9)] flex items-center justify-center text-4xl animate-pulse">
            🥚
          </div>
          <p className="mt-8 text-neutral-800 text-sm font-black text-center uppercase tracking-wide">
            Modo Ovoscópio de Tela Ativo
          </p>
          <p className="text-xs text-neutral-500 text-center mt-2 max-w-xs">
            Posicione a ponta arredondada do ovo sobre o círculo iluminado em um quarto escuro. Toque em qualquer lugar para sair.
          </p>
        </div>
      )}

      {/* Hero / O que é ovoscopia */}
      <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xl">
            🔦
          </div>
          <div>
            <h2 className="text-lg font-black text-[#2C2523] dark:text-[#EFE9E4]">
              Guia de Ovoscopia & Checagem
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Identificação de embriões e ovos claros
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-purple-50/50 dark:bg-purple-950/20 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/50">
          A ovoscopia é o ato de iluminar o ovo em um ambiente escuro para enxergar através da casca se o embrião está se desenvolvendo. Isso permite retirar ovos goros (inférteis) antes que apodreçam e contaminem a chocadeira.
        </p>

        {/* Botão Lanterna de Tela */}
        <button
          onClick={() => setScreenLightActive(true)}
          className="w-full py-3 px-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition shadow-xs"
        >
          <Flashlight className="w-4 h-4 text-amber-400 dark:text-amber-600" />
          <span>Ativar Luz Ovoscópio na Tela do Celular</span>
        </button>
      </div>

      {/* Seção Como checar ovos */}
      <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          <span>Como Checar os Ovos com Segurança</span>
        </h3>

        <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          <div className="flex items-start gap-2">
            <span className="font-bold text-[#D35400] text-sm leading-none">•</span>
            <p>Faça o procedimento em um cômodo completamente escuro.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-[#D35400] text-sm leading-none">•</span>
            <p>Use a lanterna do celular bem encostada no polo mais largo do ovo (onde fica a câmara de ar).</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-[#D35400] text-sm leading-none">•</span>
            <p>Não demore mais de 10 a 15 minutos com a chocadeira aberta para não resfriar os ovos.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-red-500 text-sm leading-none">•</span>
            <p className="font-semibold text-red-600 dark:text-red-400">
              Descarte imediatamente ovos claros (sem embrião) ou com anel de sangue para evitar explosão de gás e contaminação bacteriana.
            </p>
          </div>
        </div>
      </div>

      {/* Os 4 Casos da Ovoscopia */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 px-1">
          O Que Você Irá Ver na Casca (4 Casos):
        </h3>

        {/* Caso 1: Ovo Fértil com Embrião Vivo */}
        <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-4.5 border-2 border-emerald-400 dark:border-emerald-600/60 shadow-xs space-y-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
              ✅ Ovo Fértil com Embrião Vivo (D7 a D10)
            </h4>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Presença de uma <strong>&quot;teia de aranha&quot;</strong> de vasos sanguíneos vermelhos finos partindo de um ponto escuro central (o embrião). Com atenção, é possível notar leve pulsação e pequenos movimentos.
          </p>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            Ação: Manter na chocadeira e continuar a viragem!
          </div>
        </div>

        {/* Caso 2: Ovo Claro / Branco (Infértil) */}
        <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-4.5 border-2 border-neutral-300 dark:border-neutral-700 shadow-xs space-y-2">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-neutral-400 shrink-0" />
            <h4 className="font-bold text-sm text-neutral-700 dark:text-neutral-300">
              ❌ Ovo Claro / Branco (Infértil / Goro)
            </h4>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Ovo <strong>totalmente transparente ou amarelado</strong>. A luz atravessa o ovo sem nenhuma sombra de veias, apenas com a sombra difusa da gema que se move livremente.
          </p>
          <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[11px] font-bold text-red-600 dark:text-red-400">
            Ação: Descartar. Não é fértil e não vai nascer.
          </div>
        </div>

        {/* Caso 3: Anel de Sangue (Morte Precoce) */}
        <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-4.5 border-2 border-amber-400 dark:border-amber-600/60 shadow-xs space-y-2">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">
              ⚠️ Anel de Sangue (Morte Precoce)
            </h4>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Um <strong>círculo ou linha vermelha visível na casca</strong>, sem ramificações ou teia de vasos. O embrião começou a se desenvolver nos primeiros dias, mas morreu.
          </p>
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[11px] font-bold text-amber-700 dark:text-amber-300">
            Ação: Descartar. O ovo está morto e começará a apodrecer.
          </div>
        </div>

        {/* Caso 4: Embrião Formado (2ª Ovoscopia) */}
        <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-4.5 border-2 border-purple-400 dark:border-purple-600/60 shadow-xs space-y-2">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <h4 className="font-bold text-sm text-purple-800 dark:text-purple-300">
              ✅ Embrião Formado (2ª Ovoscopia - D14 em diante)
            </h4>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            O interior fica <strong>quase todo escuro e opaco</strong>. Apenas a câmara de ar na ponta arredondada fica límpida e transparente. O embrião ocupa quase todo o espaço e pode ser visto se mexendo.
          </p>
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[11px] font-bold text-purple-700 dark:text-purple-300">
            Ação: Pronto para a fase final! Prepare para parar a virada no D18.
          </div>
        </div>
      </div>

      {/* Dicas Rápidas para o Sucesso */}
      <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#D35400] dark:text-[#FFB07F]" />
          <span>Dicas Rápidas para o Sucesso</span>
        </h3>

        <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
          <div className="p-2.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40">
            <strong>1. Descanso pré-chocadeira:</strong> Se os ovos vieram pelos correios ou viagem, deixe-os descansar em temperatura ambiente por 12 a 24 horas antes de ligar a chocadeira.
          </div>
          <div className="p-2.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40">
            <strong>2. Posição dos ovos:</strong> Coloque sempre a ponta mais fina para baixo ou deitados naturalmente. Nunca coloque a ponta redonda para baixo.
          </div>
          <div className="p-2.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40">
            <strong>3. Água filtrada e morna:</strong> Ao repor a água na chocadeira, use água filtrada levemente morna para não derrubar a temperatura interna repentinamente.
          </div>
        </div>
      </div>

      {/* Tabela Geral de Incubação por Ave */}
      <div className="bg-white dark:bg-[#221C1A] rounded-3xl p-5 border border-orange-200/60 dark:border-neutral-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            Tabela Geral de Incubação por Ave
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Referência rápida com todas as espécies suportadas
          </p>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 text-[10px] uppercase font-bold">
                <th className="py-2 px-2">Ave</th>
                <th className="py-2 px-1 text-center">Dias</th>
                <th className="py-2 px-1 text-center">Checagens</th>
                <th className="py-2 px-1 text-center">Trava</th>
                <th className="py-2 px-1 text-center">Temp</th>
                <th className="py-2 px-1 text-center">Umid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {SPECIES_PRESETS.filter((s) => s.id !== 'personalizado').map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                  <td className="py-2 px-2 font-semibold flex items-center gap-1.5 whitespace-nowrap">
                    <span>{s.emoji}</span>
                    <span>{s.nome.split('/')[0]}</span>
                  </td>
                  <td className="py-2 px-1 text-center font-bold text-[#D35400] dark:text-[#FFB07F]">
                    {s.diasTotais}d
                  </td>
                  <td className="py-2 px-1 text-center text-purple-600 dark:text-purple-300">
                    D{s.diaOvoscopia1}/{s.diaOvoscopia2}
                  </td>
                  <td className="py-2 px-1 text-center text-red-500 font-bold">
                    D{s.diaPararVirada}
                  </td>
                  <td className="py-2 px-1 text-center">
                    {s.temperatura}°C
                  </td>
                  <td className="py-2 px-1 text-center whitespace-nowrap text-neutral-500">
                    {s.umidadeInicial}%/{s.umidadeEclosao}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
