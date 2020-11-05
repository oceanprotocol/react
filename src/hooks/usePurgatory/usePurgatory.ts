import { DDO, DID } from "@oceanprotocol/lib";
import { useState } from 'react';
import { listAssets, listAccounts } from '@oceanprotocol/list-purgatory'


interface UsePurgatory {
    isAccountInPurgatory: boolean
    isAssetInPurgatory: boolean

  }

function usePurgatory(asset?: DID | string | DDO): UsePurgatory {

    const [ isAccountInPurgatory, setIsAccountInPurgatory] = useState(false)
    const [ isAssetInPurgatory, setIsAssetInPurgatory] = useState(false)

    return {
        isAccountInPurgatory,
        isAssetInPurgatory
    }
}

export { usePurgatory, UsePurgatory }
export default usePurgatory