import { useLinkPreview } from '@/hooks/useLinkPreview'

const LinkPreviewCard = ({ card }) => {
  const { data: preview, isLoading } = useLinkPreview(card.href)

  return (
    <a
      href={card.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-lg overflow-hidden transition hover:shadow-lg ${card.bgColor}`}
    >
      {isLoading ? (
        <div className="relative overflow-hidden rounded-md p-4">
          <div className="h-32 bg-gray-300 dark:bg-gray-600 mb-2 rounded-md" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 w-3/4 mb-1 rounded" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 w-1/2 rounded" />
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20" style={{ transform: 'translateX(-100%)' }} />
        </div>
      ) : (
        <>
          {preview?.image && (
            <img src={preview.image} alt="" className="w-full h-32 object-cover" />
          )}
          <div className="p-4 dark:text-black text-white">
            <h3 className="text-lg font-semibold">{preview?.title || card.title || 'Enlace externo'}</h3>
            <p className="text-sm">{preview?.description || card.description || 'Descripción no disponible.'}</p>
          </div>
        </>
      )}
    </a>
  )
}

export default LinkPreviewCard
