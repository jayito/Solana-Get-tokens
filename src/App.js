import { useEffect } from "react";
import * as anchor from "@project-serum/anchor";
import web3 from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { programs } from '@metaplex/js';
import axios from "axios";

const { metadata: { Metadata } } = programs;

export default function App() {
    const wallet = useAnchorWallet();
    const rpcHost = "https://api.mainnet-beta.solana.com";
    const connection = new anchor.web3.Connection(rpcHost);
    let nftData = [];

    useEffect(() => {
        if (!wallet) return;
        userNft();
    }, []);

    const userNft = async () => {
        let wal_Pubkey = new web3.PublicKey('6z2V...fskg');
        const tokens = await connection.getTokenAccountsByOwner(wal_Pubkey, { programId: TOKEN_PROGRAM_ID });
        let result = [];
        tokens.value.map((val) => {
            result.push(getNftData(val.pubkey));
        });

        Promise.all(result).then((re) => {
            console.log(nftData);
        });
    }

    const getNftData = async (pubkey) => {
        let nftItem = [];
        const nftBalanceData = await connection.getTokenAccountBalance(pubkey);
        const account = await connection.getParsedAccountInfo(pubkey, { encoding: "jsonParsed" });
        const nftMintAddress = account.value.data.parsed.info.mint;
        const metadataAccount = await Metadata.getPDA(new web3.PublicKey(nftMintAddress));
        const metadat = await Metadata.load(connection, metadataAccount);
        const uri = metadat.data.data.uri;
        const uriData = await axios.get(uri);
        nftItem['balance'] = nftBalanceData.value.amount;
        nftItem['metadata'] = uriData.data;
        nftData.push(nftItem);
    }
}