import { ACTIONS_CORS_HEADERS, ActionGetResponse, ActionPostRequest, createPostResponse } from '@solana/actions'
import * as anchor from '@coral-xyz/anchor'
import { Ballotana } from '@/../../anchor/target/types/ballotana'
import { Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { BN, Program } from '@coral-xyz/anchor'

import idl from '@/lib/ballotana.json'

export const OPTIONS = GET

export async function GET(request: Request) {
  const actionMetada: ActionGetResponse = {
    icon: 'https://ik.imagekit.io/s4x4swotbc/chat.png?updatedAt=1753376282597',
    title: 'Will You Hack History or Scroll Past It?',
    description: 'Join the action at Athena Hacker House. Are you in the zone or on the sidelines? Choose your side.',
    label: 'cast your choice',
    links: {
      actions: [
        {
          href: 'http://localhost:3000/api/vote?choice=avhidotsol',
          label: "Count me in, I'm hacking",
          type: 'transaction',
        },
        {
          href: 'http://localhost:3000/api/vote?choice=scroll',
          label: "Nah, I'll spectate",
          type: 'transaction',
        },
      ],
    },
  }
  return Response.json(actionMetada, { headers: ACTIONS_CORS_HEADERS })
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const choice = url.searchParams.get('choice')

  if (choice != 'avhidotsol' && choice != 'scroll') {
    return new Response('invalid choice', { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  const connection = new anchor.web3.Connection('http://127.0.0.1:8899', 'confirmed')
  const program: Program<Ballotana> = new Program(idl as Ballotana, { connection })

  const body: ActionPostRequest = await request.json()
  console.log(body)
  let voter: PublicKey
  try {
    voter = new PublicKey(body.account)
  } catch (error) {
    return new Response('invalid account', { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  const instruction = await program.methods.initializeVote(choice, new BN(1)).accounts({ signer: voter }).instruction()

  const blockhash = await connection.getLatestBlockhash()

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction)

  const response = await createPostResponse({
    fields: {
      type: 'transaction',
      transaction,
      message: 'vote submitted',
    },
  })

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS })
}
