import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ballotana } from "../target/types/ballotana";
import { expect } from "chai";

describe("ballotana", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ballotana as Program<Ballotana>;

  it("Initializes a poll", async () => {
    const pollId = new anchor.BN(1);
    const description = "Who is the best Rust dev?";
    const pollStart = Math.floor(Date.now() / 1000); // current timestamp
    const pollEnd = pollStart + 3600; // +1 hour

    // Derive PDA
    const [pollPda, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const tx = await program.methods
      .initializePoll(
        pollId,
        description,
        new anchor.BN(pollStart),
        new anchor.BN(pollEnd)
      )
      .accounts({
        signer: provider.wallet.publicKey,
        poll: pollPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Poll initialized, tx:", tx);

    const pollAccount = await program.account.poll.fetch(pollPda);
    console.log("Poll account data:", pollAccount);

    expect(pollAccount.pollId.toNumber()).to.equal(1);
    expect(pollAccount.description).to.equal(description);
    expect(pollAccount.pollStart.toNumber()).to.equal(pollStart);
    expect(pollAccount.pollEnd.toNumber()).to.equal(pollEnd);
    expect(pollAccount.candidateAmount.toNumber()).to.equal(0);
  });
});
