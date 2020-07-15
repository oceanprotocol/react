import React from 'react'
import { useOcean, usePublish } from '@oceanprotocol/react'
import { Metadata, DDO } from '@oceanprotocol/lib'
import { useState } from 'react'
import { useEffect } from 'react'
import shortid from 'shortid'
export function AllDdos() {
    const { accountId, ocean } = useOcean()

    const [ddos, setDdos] = useState<DDO[] | undefined>()


    useEffect(() => {
        async function init() {
            if (ocean === undefined) return
            const assets = await ocean.assets.query({
                page: 1,
                offset: 10,
                query: {},
                sort: { created: -1 }
            })

            setDdos(assets.results)
        }
        init()
    }, [ocean])

    return (
        <>
            <div>Assets</div> <br/>
            <div style={{flexDirection: "column"}}>{ddos?.map((ddo) => {
                return <div key={shortid.generate()}><span  >{ddo.id} / {ddo.dataToken }</span><br/></div>
            })}
            </div>
        </>
    )
}
