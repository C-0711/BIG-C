import React, { useState, useEffect } from 'react'

export default function EntitiesPage() {
  const [entities, setEntities] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntities()
  }, [filter])

  const loadEntities = async () => {
    setLoading(true)
    try {
      const entityType = filter !== 'all' ? `?entity_type=${filter}` : ''
      const response = await fetch(`http://localhost:8766/api/entities${entityType}`)
      const data = await response.json()
      setEntities(data)
    } catch (error) {
      console.error('Error loading entities:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Entities</h1>

      <div className="mb-6 flex gap-2">
        {['all', 'PERSON', 'ORG', 'GPE'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg ${
              filter === type
                ? 'bg-[#374151] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {type === 'all' ? 'All' : type === 'GPE' ? 'Locations' : type === 'ORG' ? 'Organizations' : 'People'}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading entities...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entities.map((entity) => (
            <div key={entity.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">{entity.name}</h3>
              <p className="text-sm text-gray-500">{entity.entity_type}</p>
              <p className="text-sm text-gray-600 mt-2">
                Mentioned {entity.mention_count} times
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
