import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

const BrandContext = createContext(null)

export function BrandProvider({ children }) {
  const [brands, setBrands]             = useState([])
  const [currentBrand, setCurrentBrand] = useState(
    () => JSON.parse(localStorage.getItem('warden_brand') || 'null')
  )

  useEffect(() => {
    api.listBrands()
      .then(data => {
        const list = data.brands || []
        setBrands(list)
        if (!currentBrand && list.length > 0) {
          setCurrentBrand(list[0])
          localStorage.setItem('warden_brand', JSON.stringify(list[0]))
        }
      })
      .catch(() => {})
  }, [])

  const setBrand = (brand) => {
    setCurrentBrand(brand)
    localStorage.setItem('warden_brand', JSON.stringify(brand))
  }

  return (
    <BrandContext.Provider value={{ currentBrand, setBrand, brands, setBrands }}>
      {children}
    </BrandContext.Provider>
  )
}

export const useBrand = () => useContext(BrandContext)
