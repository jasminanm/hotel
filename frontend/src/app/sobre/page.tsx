import Link from 'next/link';

export default function SobrePage() {
  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/the_site_fachada_0003.webp), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover, cover',
        backgroundPosition: 'center, center',
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundColor: '#667eea',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-indigo-600/40 to-purple-600/40" />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Sobre nós</h1>

          <p className="text-gray-700 mb-4 leading-relaxed">
            O Hotel Europa é um estabelecimento de pequena dimensão, pensado para quem procura
            conforto e um atendimento próximo. A nossa equipa de receção trabalha diariamente para
            garantir estadias tranquilas, desde da reserva até ao check-out.
          </p>

          <p className="text-gray-700 mb-4 leading-relaxed">
            Este site permite consultar tipos de quarto disponíveis, efetuar reservas online e
            acompanhar o estado das suas estadias. A área de gerência apoia a receção na gestão de
            quartos, hóspedes, pagamentos e relatórios do hotel.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Política de reservas</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>As datas de estadia devem ser futuras no momento da reserva.</li>
            <li>O cliente pode alterar ou cancelar uma reserva até 24 horas antes do check-in.</li>
            <li>Após esse prazo, alterações e cancelamentos deixam de estar disponíveis na área do cliente.</li>
            <li>Os pagamentos são registados na receção; o sistema emite comprovativos simulados.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contactos</h2>
          <p className="text-gray-700 mb-1">Rua das Flores, 120 — Lisboa</p>
          <p className="text-gray-700 mb-1">reservas@hoteleuropa.pt</p>
          <p className="text-gray-700 mb-8">+351 210 000 000</p>

          <Link
            href="/"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
