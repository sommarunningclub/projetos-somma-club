import Link from "next/link"
import Image from "next/image"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Entenda como utilizamos cookies no site do SOMMA Running Club Membros.",
}

export default function PoliticaDeCookiesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao site
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/webrenew-brandmark.png"
            alt="SOMMA Running Club"
            width={120}
            height={40}
            className="opacity-80"
          />
        </div>

        <h1 className="text-3xl md:text-4xl font-light text-center mb-4">Política de Cookies</h1>
        <p className="text-zinc-400 text-center mb-12">Última atualização: Janeiro de 2026</p>

        <div className="prose prose-invert prose-zinc max-w-none">
          {/* Introdução */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-light text-[#ff4f2d] mb-4">1. O que são Cookies?</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador, tablet ou celular)
              quando você visita nosso site. Eles nos ajudam a fazer o site funcionar corretamente, torná-lo mais
              seguro, proporcionar uma melhor experiência ao usuário e entender como o site está sendo utilizado.
            </p>
          </section>

          {/* Tipos de Cookies */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-light text-[#ff4f2d] mb-4">2. Tipos de Cookies que Utilizamos</h2>

            <div className="space-y-6">
              <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                <h3 className="text-lg font-medium text-white mb-2">Cookies Essenciais</h3>
                <p className="text-zinc-400 text-sm">
                  Esses cookies são necessários para o funcionamento básico do site. Eles permitem que você navegue pelo
                  site e use recursos essenciais, como áreas seguras e carrinho de compras. Sem esses cookies, o site
                  não pode funcionar corretamente.
                </p>
                <ul className="mt-3 text-sm text-zinc-400 list-disc list-inside space-y-1">
                  <li>Autenticação e segurança</li>
                  <li>Preferências de sessão</li>
                  <li>Consentimento de cookies</li>
                </ul>
              </div>

              <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                <h3 className="text-lg font-medium text-white mb-2">Cookies de Análise/Desempenho</h3>
                <p className="text-zinc-400 text-sm">
                  Esses cookies nos permitem contar visitas e fontes de tráfego para que possamos medir e melhorar o
                  desempenho do nosso site. Eles nos ajudam a saber quais páginas são mais e menos populares e ver como
                  os visitantes navegam pelo site.
                </p>
                <ul className="mt-3 text-sm text-zinc-400 list-disc list-inside space-y-1">
                  <li>Google Analytics</li>
                  <li>Métricas de desempenho</li>
                  <li>Relatórios de uso</li>
                </ul>
              </div>

              <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                <h3 className="text-lg font-medium text-white mb-2">Cookies de Marketing</h3>
                <p className="text-zinc-400 text-sm">
                  Esses cookies são usados para rastrear visitantes em sites. A intenção é exibir anúncios relevantes e
                  envolventes para o usuário individual e, portanto, mais valiosos para editores e anunciantes
                  terceirizados.
                </p>
                <ul className="mt-3 text-sm text-zinc-400 list-disc list-inside space-y-1">
                  <li>Facebook Pixel</li>
                  <li>Google Ads</li>
                  <li>Remarketing</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Como Gerenciar */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-light text-[#ff4f2d] mb-4">3. Como Gerenciar seus Cookies</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Você pode gerenciar suas preferências de cookies a qualquer momento através do banner de cookies que
              aparece ao visitar nosso site pela primeira vez, ou através das configurações do seu navegador.
            </p>
            <p className="text-zinc-300 leading-relaxed mb-4">A maioria dos navegadores permite que você:</p>
            <ul className="text-zinc-400 list-disc list-inside space-y-2 mb-4">
              <li>Veja quais cookies você tem e delete-os individualmente</li>
              <li>Bloqueie cookies de terceiros</li>
              <li>Bloqueie cookies de sites específicos</li>
              <li>Bloqueie todos os cookies</li>
              <li>Delete todos os cookies quando fechar o navegador</li>
            </ul>
            <p className="text-zinc-400 text-sm">
              <strong className="text-zinc-300">Nota:</strong> Se você bloquear os cookies, algumas partes do nosso site
              podem não funcionar corretamente.
            </p>
          </section>

          {/* Dados Coletados */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-light text-[#ff4f2d] mb-4">4. Dados que Coletamos</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Quando você aceita os cookies, podemos coletar as seguintes informações:
            </p>
            <ul className="text-zinc-400 list-disc list-inside space-y-2">
              <li>Endereço IP (anonimizado)</li>
              <li>Tipo de navegador e dispositivo</li>
              <li>Páginas visitadas e tempo de permanência</li>
              <li>Origem do tráfego (como você chegou ao site)</li>
              <li>Preferências de idioma e região</li>
              <li>Data e hora da visita</li>
            </ul>
          </section>

          {/* Armazenamento */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-light text-[#ff4f2d] mb-4">5. Tempo de Armazenamento</h2>
            <p className="text-zinc-300 leading-relaxed">Os cookies têm diferentes períodos de validade:</p>
            <ul className="text-zinc-400 list-disc list-inside space-y-2 mt-4">
              <li>
                <strong className="text-zinc-300">Cookies de sessão:</strong> São excluídos quando você fecha o
                navegador
              </li>
              <li>
                <strong className="text-zinc-300">Cookies persistentes:</strong> Permanecem por até 12 meses
              </li>
              <li>
                <strong className="text-zinc-300">Cookies de terceiros:</strong> Seguem a política de cada fornecedor
              </li>
            </ul>
          </section>

          {/* Seus Direitos */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-light text-[#ff4f2d] mb-4">6. Seus Direitos (LGPD)</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
            </p>
            <ul className="text-zinc-400 list-disc list-inside space-y-2">
              <li>Confirmação da existência de tratamento de dados</li>
              <li>Acesso aos seus dados pessoais</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Portabilidade dos dados</li>
              <li>Informação sobre compartilhamento de dados</li>
              <li>Revogação do consentimento</li>
            </ul>
          </section>

          {/* Contato */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-light text-[#ff4f2d] mb-4">7. Contato</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">
              Se você tiver dúvidas sobre esta Política de Cookies ou sobre como tratamos seus dados, entre em contato
              conosco:
            </p>
            <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
              <p className="text-zinc-300">
                <strong>SOMMA Running Club</strong>
              </p>
              <p className="text-zinc-400 text-sm">CNPJ: 61.315.987/0001-28</p>
              <p className="text-zinc-400 text-sm mt-2">
                WhatsApp:{" "}
                <a
                  href="https://wa.me/5561991780334"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ff4f2d] hover:underline"
                >
                  (61) 99178-0334
                </a>
              </p>
              <p className="text-zinc-400 text-sm">
                Instagram:{" "}
                <a
                  href="https://www.instagram.com/somma.club/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ff4f2d] hover:underline"
                >
                  @somma.club
                </a>
              </p>
            </div>
          </section>

          {/* Alterações */}
          <section>
            <h2 className="text-xl md:text-2xl font-light text-[#ff4f2d] mb-4">8. Alterações nesta Política</h2>
            <p className="text-zinc-300 leading-relaxed">
              Podemos atualizar esta Política de Cookies periodicamente para refletir alterações em nossas práticas ou
              por outros motivos operacionais, legais ou regulatórios. Recomendamos que você revise esta página
              regularmente para se manter informado sobre nosso uso de cookies.
            </p>
          </section>
        </div>

        {/* Back to top */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff4f2d] hover:bg-[#ff6b4a] text-white font-medium rounded-lg transition-colors"
          >
            Voltar ao Site Principal
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-zinc-500 text-sm">
          © 2025 SOMMA Running Club Membros | CNPJ 61.315.987/0001-28
        </div>
      </footer>
    </div>
  )
}
