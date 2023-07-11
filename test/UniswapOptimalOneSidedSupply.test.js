const { expect } = require("chai");
const {
  WETH,
  DAI,
  USDC,
  USDT,
  WETH_WHALE,
  DAI_WHALE,
  USDC_WHALE,
  USDT_WHALE,
} = require("../config");
const BN = require("bn.js");
const ERC20ABI = require("@uniswap/v2-core/build/ERC20.json").abi;

describe("UniswapOptimalOneSidedSupply", () => {
  // const AMOUNT = pow(10, 18).mul(new BN(1000))
  const AMOUNT = ethers.utils.parseUnits("1000");

  let contract;
  let fromToken;
  let toToken;
  let pair;
  const snapshot = async () => {
    return {
      lp: await pair.balanceOf(contract.address),
      fromToken: await fromToken.balanceOf(contract.address),
      toToken: await toToken.balanceOf(contract.address),
    };
  };
  beforeEach(async () => {
    fromToken = await ethers.getContractAt(ERC20ABI, DAI);
    toToken = await ethers.getContractAt(ERC20ABI, WETH);

    const UniswapOptimalOneSidedSupply = await ethers.getContractFactory(
      "UniswapOptimalOneSidedSupply"
    );
    contract = await UniswapOptimalOneSidedSupply.deploy();
    pair = await ethers.getContractAt(
      ERC20ABI,
      await contract.getPair(fromToken.address, toToken.address)
    );
    const WHALE = await ethers.getImpersonatedSigner(DAI_WHALE);

    await fromToken.connect(WHALE).approve(contract.address, AMOUNT);
  });

  it("optimal swap", async () => {
    // const before = await snapshot()
    const WHALE = await ethers.getImpersonatedSigner(DAI_WHALE);

    await contract
      .connect(WHALE)
      .zap(fromToken.address, toToken.address, AMOUNT);
    const after = await snapshot();

    console.log("lp", after.lp.toString());
    console.log("from", after.fromToken.toString());
    console.log("to", after.toToken.toString());
  });

  it("sub-optimal swap", async () => {
    // const before = await snapshot()
    const WHALE = await ethers.getImpersonatedSigner(DAI_WHALE);

    await contract
      .connect(WHALE)
      .subOptimalZap(fromToken.address, toToken.address, AMOUNT);
    const after = await snapshot();
    console.log("lp", after.lp.toString());
    console.log("from", after.fromToken.toString());
    console.log("to", after.toToken.toString());
  });
});
