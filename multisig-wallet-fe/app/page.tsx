"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Psbt } from "bitcoinjs-lib";

import Notiflix from "notiflix";

import WalletContext from "./contexts/WalletContext";
import {
  Account,
  BatchTypes,
  IAirdropWalletList,
  INewVault,
  IRequest,
  ISyndicateWalletList,
  IWalletList,
  SIGN_MESSAGE,
  TEST_MODE,
  WalletTypes,
} from "./utils/utils";
import {
  IErr,
  IList,
  IRuneAssets,
  IRuneDetail,
  ISelectOption,
} from "./utils/_type";

import {
  Tabs,
  Tab,
  Input,
  Button,
  Checkbox,
  Card,
  CardBody,
  CardHeader,
  Link,
  Navbar,
  NavbarContent,
  NavbarItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@nextui-org/react";
import * as Bitcoin from "bitcoinjs-lib";
import Select from "react-dropdown-select";

import {
  acceptMarketplceController,
  acceptSyndicateMarketplceController,
  batchSyndicateTransferController,
  batchTransferController,
  broadcastingController,
  broadcastingSyndicateController,
  cancelMarketplceController,
  cancelRequestPsbtController,
  cancelSyndicateMarketplceController,
  cancelSyndicateRequestPsbtController,
  createNewAirdropVault,
  createNewSyndicateVault,
  createNewVault,
  etchingRuneTokens,
  execPsbt,
  fetchAirdropWalletsController,
  fetchListController,
  fetchRequestListController,
  fetchRequestPsbtController,
  fetchRuneListByAddressController,
  fetchSyndicateRequestController,
  fetchSyndicateRequestPsbtController,
  fetchSyndicateWalletsController,
  fetchVaultController,
  marketplaceListController,
  marketplaceSyndicateListController,
  mintAirdropController,
  mintSyndicateController,
  pre_buyListController,
  pre_buySyndicateListController,
  ready_buyListController,
  ready_buySyndicateListController,
  updateRequestPsbtController,
  updateSyndicateRequest,
  updateVault,
  walletConnect,
  writeHistory,
} from "./controller";
import { MdOutlineContentCopy } from "react-icons/md";
import { SlWallet } from "react-icons/sl";
import {
  AddressPurpose,
  BitcoinNetworkType,
  getAddress,
  signMessage,
} from "sats-connect";
import { Loading } from "./components/Loading";
import { useClipboard } from "use-clipboard-copy";

// React Icons
import { FaVault } from "react-icons/fa6";
import { SiVaultwarden } from "react-icons/si";
import { ImShield } from "react-icons/im";
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";
import { AiOutlineUpload } from "react-icons/ai";
import { RadioGroup, Radio } from "@nextui-org/react";

export default function Page() {
  const coSignerRef = useRef(null);

  const runeNameRef = useRef(null);
  const runeAmountRef = useRef(null);
  const runePriceRef = useRef(null);
  const runeSymbolRef = useRef(null);

  const airdropAmountRef = useRef(null);
  const syndicateAmountRef = useRef(null);

  const [err, setErr] = useState<IErr>();
  const [transactionID, setTransactionID] = useState("");
  const [newVault, setNewVault] = useState<string>("");
  const [selectedVault, setSelectedVault] = useState<IWalletList>();
  const [selectedRequest, setSelectedRequest] = useState<IRequest>();
  const [walletList, setWalletList] = useState<IWalletList[]>();
  const [airdropWalletList, setAirdropWalletList] =
    useState<IAirdropWalletList[]>();
  const [syndicateWalletList, setSyndicateWalletList] =
    useState<ISyndicateWalletList[]>();
  const [requestList, setRequestList] = useState<IRequest[]>();
  const [syndicateRequestList, setSyndicateRequestList] =
    useState<IRequest[]>();
  const [assetsFlag, setAssetsFlag] = useState(false);

  const [selected, setSelected] = useState("multi");

  // Batch Modal
  const [modalFlag, setModalFlag] = useState(BatchTypes.Ready);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAirdropWallet, setSelectedAirdropWallet] =
    useState<IAirdropWalletList>();
  const [selectedSyndicateWallet, setSelectedSyndicateWallet] =
    useState<ISyndicateWalletList>();
  const [batchOption, setBatchOption] = useState<ISelectOption[]>();
  const [batchIndex, setBatchIndex] = useState(0);
  const [runeList, setRuneList] = useState<IRuneDetail[]>();
  // End

  // Edition Selling
  const [editionSelected, setEditionSelected] = useState("mint");
  const [editionSelected2, setEditionSelected2] = useState("mint");
  const sellPriceRef = useRef(null);
  const [list, setList] = useState<IList[]>();
  // End

  // Connect Wallet
  const [modalOpen, setModalOpen] = useState(false);
  const onConnectWalletOpen = async () => {
    setModalOpen(true);
  };
  // End

  // Loading
  const [loading, setLoading] = useState(false);
  // End

  // CreateNewVault
  const [coSignerCount, setCoSignerCount] = useState(0);
  const [coSigner, setCoSigner] = useState(0);
  const changeCosignerHandler = async (index: number) => {
    const temp = Math.min(Math.max(coSigner + index, 0), coSignerCount);
    console.log("temp ==> ", temp);
    setCoSigner(temp);
  };

  const [typeSelected, setTypeSelected] = useState("NativeSegwit");
  // End

  // Image Upload
  const [avatar, setAvatar] = useState({
    preview: "",
  });

  const fileInput = useRef<HTMLInputElement>(null);
  const uploadFile = async (evt: any) => {
    evt.preventDefault();

    console.log("uploaded file ==> ", fileInput?.current?.files);
    if (fileInput?.current?.files?.[0]!) {
      setAvatar({
        preview: URL.createObjectURL(fileInput?.current?.files?.[0]!),
      });
    }
  };

  const fileInputOfListRef = useRef<HTMLInputElement>(null);
  const uploadFileOfList = async (evt: any) => {
    evt.preventDefault();

    console.log("uploaded file ==> ", fileInputOfListRef?.current?.files);
    if (fileInputOfListRef?.current?.files?.[0]!) {
      setAvatar({
        preview: URL.createObjectURL(fileInputOfListRef?.current?.files?.[0]!),
      });
    }
  };
  // End

  const {
    walletType,
    ordinalAddress,
    ordinalPublicKey,
    paymentAddress,
    paymentPublicKey,
    pageIndex,
    setPageIndex,
    setWalletType,
    setOrdinalAddress,
    setPaymentAddress,
    setPaymentPublicKey,
    setOrdinalPublicKey,
  } = useContext(WalletContext);

  const isConnected = Boolean(ordinalAddress);

  const batchModalOpen = async (wallet: IAirdropWalletList) => {
    setSelectedAirdropWallet(wallet);
    console.log("wallet.edition ==> ", wallet);
    const tempOption: ISelectOption[] = [];
    const runeAssets = await fetchRuneListByAddressController(wallet.address);
    if (runeAssets.length) {
      setRuneList(runeAssets);
      console.log("runeAssets ==> ", runeAssets);
      runeAssets.map((rune: IRuneDetail, index: number) => {
        tempOption.push({
          value: index,
          label: rune.spacedRune,
        });
      });
      console.log("tempOption ==> ", tempOption);
      setModalFlag(BatchTypes.Ready);
      setBatchOption(tempOption);
      onOpen();
    } else {
      Notiflix.Notify.failure("No assets in this vault.");
    }
  };

  const onChangeHandler = () => {
    setErr({
      cosigner: "",
      thresHold: "",
    });
    if (coSignerRef.current) {
      const str: string = (coSignerRef.current as any).value;
      const length = str.split("\n").length;
      console.log("length ==> ", length);
      setCoSignerCount(length);
    }
  };

  const updateWallet = async () => {
    try {
      if (!selectedVault) return;
      let cosignerList = [];
      let thresHoldValue = "";

      if (!fileInput?.current?.files?.[0]!) {
        Notiflix.Notify.failure("The banner image is required.");
        return;
      }

      const formData = new FormData();
      formData.append("file", fileInput?.current?.files?.[0]!);

      const response = await fetch("/api/uploadImage", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("result ==> ", result);
      if (!result.success) {
        Notiflix.Notify.failure("Get error while uploading image.");
        return;
      }
      // return
      const imageUrl = result.payload;

      if (coSignerRef.current)
        cosignerList = (coSignerRef.current["value"] as any).split("\n");
      thresHoldValue = coSigner.toString();

      if (walletType == WalletTypes.UNISAT) {
        const result = await updateVault(
          selectedVault,
          cosignerList,
          parseInt(thresHoldValue),
          ordinalAddress,
          imageUrl
        );
        console.log("New Vault on updateWallet==> ", result);
        if (result.success) {
          Notiflix.Notify.success(result.message);
          setNewVault(result.payload);
        } else {
          Notiflix.Notify.failure(result.message);
        }

        console.log(result.payload);
      }
    } catch (error) {
      console.log("submit ==> ", error);
    }
  };

  const onCreateNewWallet = async () => {
    try {
      let cosignerList = [];
      // let thresHoldValue = "";
      const assets: IRuneAssets = {
        runeName: "None",
        runeAmount: "None",
        initialPrice: "None",
        runeSymbol: "None",
        creatorAddress: ordinalAddress,
      };

      if (!fileInput?.current?.files?.[0]!) {
        Notiflix.Notify.failure("The banner image is required.");
        return;
      }

      if (runeNameRef.current) assets.runeName = runeNameRef.current["value"];
      if (runeAmountRef.current)
        assets.runeAmount = runeAmountRef.current["value"];
      if (runePriceRef.current)
        assets.initialPrice = runePriceRef.current["value"];
      if (runeSymbolRef.current)
        assets.runeSymbol = runeSymbolRef.current["value"];

      if (coSignerRef.current)
        cosignerList = (coSignerRef.current["value"] as any).split("\n");

      const formData = new FormData();
      formData.append("file", fileInput?.current?.files?.[0]!);

      const response = await fetch("/api/uploadImage", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("result ==> ", result);
      if (!result.success) {
        Notiflix.Notify.failure("Get error while uploading image.");
        return;
      }
      // return
      const imageUrl = result.payload;
      // if (thresHold.current) thresHoldValue = thresHold.current["value"];
      if (!coSignerCount) return;
      const thresHoldValue = coSignerCount.toString();

      if (walletType == WalletTypes.UNISAT) {
        const result = await createNewVault(
          cosignerList,
          thresHoldValue,
          assets,
          imageUrl,
          typeSelected
        );
        console.log("New Vault on submit ==> ", result);

        // if (assets.runeName != "None") {
        //   const runeEtchingResult = await etchingRuneTokens(assets);
        //   console.log("Rune Etching Result ==> ", runeEtchingResult);
        // }

        if (result.success) {
          Notiflix.Notify.success(result.message);
          console.log("new address ==> ", result.payload.vault.payload.address);
          setNewVault(result.payload.vault.payload.address);
        } else Notiflix.Notify.failure(result.message);

        console.log("vault ==> ", result.vault.payload);
        console.log("rune ==> ", result.rune.payload);

        // }
      }
      // else if (walletType == WalletTypes.XVERSE) await xverseSendBTC(destinationAddress, parseInt(amountToTransfer));
      // else if (walletType == WalletTypes.MAGICEDEN) await MEsendBtc(destinationAddress, parseInt(amountToTransfer));
    } catch (error) {
      console.log("submit ==> ", error);
    }
  };

  const onCreateNewAirdropWallet = async () => {
    try {
      let cosignerList = [paymentPublicKey];
      let thresHoldValue = "1";
      const assets: IRuneAssets = {
        runeName: "None",
        runeAmount: "None",
        initialPrice: "None",
        runeSymbol: "None",
        creatorAddress: ordinalAddress,
      };

      if (!fileInput?.current?.files?.[0]!) {
        Notiflix.Notify.failure("The banner image is required.");
        return;
      }

      if (runeNameRef.current) assets.runeName = runeNameRef.current["value"];
      if (runeAmountRef.current)
        assets.runeAmount = runeAmountRef.current["value"];
      if (runePriceRef.current)
        assets.initialPrice = runePriceRef.current["value"];
      if (runeSymbolRef.current)
        assets.runeSymbol = runeSymbolRef.current["value"];

      const formData = new FormData();
      formData.append("file", fileInput?.current?.files?.[0]!);

      const response = await fetch("/api/uploadImage", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("result ==> ", result);
      if (!result.success) {
        Notiflix.Notify.failure("Get error while uploading image.");
        return;
      }
      // return
      const imageUrl = result.payload;
      console.log("imageUrl ==> ", imageUrl);

      if (walletType == WalletTypes.UNISAT) {
        const result = await createNewAirdropVault(
          cosignerList,
          thresHoldValue,
          {
            paymentAddress,
            paymentPublicKey,
            ordinalAddress,
            ordinalPublicKey,
          },
          assets,
          imageUrl
        );
        console.log("New Vault on submit ==> ", result);

        if (result.success) {
          Notiflix.Notify.success(result.message);
          console.log("new address ==> ", result.payload.vault.payload.address);
          setNewVault(result.payload.vault.payload.address);
        } else Notiflix.Notify.failure(result.message);

        console.log("vault ==> ", result.payload.vault.payload);
        console.log("rune ==> ", result.payload.rune.payload);
      }
    } catch (error) {
      console.log("submit ==> ", error);
    }
  };

  const onCreateNewSyndicateVault = async () => {
    try {
      let cosignerList = [];
      // let thresHoldValue = "";
      const assets: IRuneAssets = {
        runeName: "None",
        runeAmount: "None",
        initialPrice: "None",
        runeSymbol: "None",
        creatorAddress: ordinalAddress,
      };

      if (!fileInput?.current?.files?.[0]!) {
        Notiflix.Notify.failure("The banner image is required.");
        return;
      }

      if (runeNameRef.current) assets.runeName = runeNameRef.current["value"];
      if (runeAmountRef.current)
        assets.runeAmount = runeAmountRef.current["value"];
      if (runePriceRef.current)
        assets.initialPrice = runePriceRef.current["value"];
      if (runeSymbolRef.current)
        assets.runeSymbol = runeSymbolRef.current["value"];

      if (coSignerRef.current)
        cosignerList = (coSignerRef.current["value"] as any).split("\n");

      const formData = new FormData();
      formData.append("file", fileInput?.current?.files?.[0]!);

      const response = await fetch("/api/uploadImage", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("result ==> ", result);
      if (!result.success) {
        Notiflix.Notify.failure("Get error while uploading image.");
        return;
      }
      // return
      const imageUrl = result.payload;
      // if (thresHold.current) thresHoldValue = thresHold.current["value"];
      if (!coSignerCount) return;
      const thresHoldValue = coSignerCount.toString();

      if (walletType == WalletTypes.UNISAT) {
        const result = await createNewSyndicateVault(
          cosignerList,
          thresHoldValue,
          {
            paymentAddress,
            paymentPublicKey,
            ordinalAddress,
            ordinalPublicKey,
          },
          assets,
          imageUrl
        );
        console.log("New Vault on submit ==> ", result);

        if (result.success) {
          Notiflix.Notify.success(result.message);
          console.log("new address ==> ", result.payload.vault.payload.address);
          setNewVault(result.payload.vault.payload.address);
        } else Notiflix.Notify.failure(result.message);

        console.log("vault ==> ", result.payload.vault.payload);
        console.log("rune ==> ", result.payload.rune.payload);

        // }
      }
      // else if (walletType == WalletTypes.XVERSE) await xverseSendBTC(destinationAddress, parseInt(amountToTransfer));
      // else if (walletType == WalletTypes.MAGICEDEN) await MEsendBtc(destinationAddress, parseInt(amountToTransfer));
    } catch (error) {
      console.log("submit ==> ", error);
    }
  };

  const fetchWallets = async () => {
    console.log("fetch wallets ==>");
    // setLoading(true);
    Notiflix.Loading.hourglass("Fetching wallets info...")
    const result = await fetchVaultController();
    console.log("result ==> ", result);
    if (result.success) {
      Notiflix.Notify.success(result.message);
      setWalletList(result.payload);
    } else {
      Notiflix.Notify.failure(result.message);
    }
    setLoading(false);
    Notiflix.Loading.remove();
  };

  const updateHandler = async (wallet: IWalletList) => {
    setPageIndex(2);
    setSelectedVault(wallet);
  };

  const updateRequestHandler = async (request: IRequest) => {
    const allowed = request.cosigner.findIndex(
      (key) => key == paymentPublicKey
    );
    console.log("allowed ==> ", allowed);
    if (allowed < 0)
      return Notiflix.Notify.failure("You are not co-signer of this wallet!");

    const repeated = request.signedCosigner.findIndex(
      (key) => key == paymentPublicKey
    );
    console.log("repeated ==> ", repeated);
    if (repeated >= 0)
      return Notiflix.Notify.failure("You already signed in this request");

    setSelectedRequest(request);
    const result = await fetchRequestPsbtController(
      request._id,
      paymentPublicKey
    );
    console.log("fetchRequestPsbtController ==> ", result);
    const psbt = result.payload;
    console.log("request psbt ==>", psbt);
    if (psbt) {
      try {
        const tempPsbt = Psbt.fromHex(psbt);
        const inputCount = tempPsbt.inputCount;
        const inputArray = Array.from({ length: inputCount }, (_, i) => i);
        console.log("inputArray ==> ", inputArray);
        const toSignInputs: {
          index: number;
          publicKey: string;
          disableTweakSigner: boolean;
        }[] = [];
        inputArray.map((value: number) =>
          toSignInputs.push({
            index: value,
            publicKey: paymentPublicKey,
            disableTweakSigner: true,
          })
        );
        console.log("toSignInputs ==> ", toSignInputs);
        const signedPsbt = await (window as any).unisat.signPsbt(psbt, {
          autoFinalized: false,
          toSignInputs,
        });
        console.log("signedPsbt ==> ", signedPsbt);
        const result = await updateRequestPsbtController(
          signedPsbt,
          request._id,
          paymentPublicKey
        );
        console.log("after update request result ==> ", result);
        if (result) {
          Notiflix.Notify.success(result.message);
          if (result.message == "Transaction broadcasting successfully.") {
            Notiflix.Notify.success(result.payload);
          }
          await fetchRequestList();
        }
      } catch (error) {
        console.log("reject sign on unisat ==> ", error);
        const result = await cancelRequestPsbtController(
          request._id,
          paymentPublicKey
        );
        console.log("after cancel request result ==> ", result);
      }
    } else {
      Notiflix.Notify.failure(result.message);
    }
  };

  const fetchRequestList = async () => {
    console.log("fetchRequestList ==> ");
    setLoading(true);
    const requestResponse = await fetchRequestListController();
    if (!requestResponse) {
      setLoading(false);
      return;
    }
    setRequestList(requestResponse);
    setLoading(false);
  };

  const fetchSyndicateRequest = async () => {
    console.log("fetchSyndicateRequest ==> ");
    setLoading(true);
    const requestResponse = await fetchSyndicateRequestController();
    console.log("fetchSyndicateRequest result ==> ", requestResponse);
    if (!requestResponse.success) {
      setLoading(false);
      return;
    }
    setSyndicateRequestList(requestResponse.payload);
    setLoading(false);
  };

  const updateSyndicateRequestHandler = async (request: IRequest) => {
    console.log("updateSyndicateRequestHandler ==> ");
    const allowed = request.cosigner.findIndex(
      (key) => key == paymentPublicKey
    );
    console.log("allowed ==> ", allowed);
    if (allowed < 0)
      return Notiflix.Notify.failure("You are not co-signer of this wallet!");

    const repeated = request.signedCosigner.findIndex(
      (key) => key == paymentPublicKey
    );
    console.log("repeated ==> ", repeated);
    if (repeated >= 0)
      return Notiflix.Notify.failure("You already signed in this request");

    setSelectedRequest(request);
    const result = await fetchSyndicateRequestPsbtController(
      request._id,
      paymentPublicKey
    );
    console.log("fetchRequestPsbtController ==> ", result);
    const psbt = result.payload;
    console.log("request psbt ==>", psbt);
    if (psbt) {
      try {
        const tempPsbt = Psbt.fromHex(psbt);
        const inputCount = tempPsbt.inputCount;
        const inputArray = Array.from({ length: inputCount }, (_, i) => i);
        console.log("inputArray ==> ", inputArray);
        const toSignInputs: { index: number; publicKey: string }[] = [];
        inputArray.map((value: number) =>
          toSignInputs.push({
            index: value,
            publicKey: paymentPublicKey,
          })
        );
        console.log("toSignInputs ==> ", toSignInputs);
        const signedPsbt = await (window as any).unisat.signPsbt(psbt, {
          autoFinalized: false,
          toSignInputs,
        });
        console.log("signedPsbt ==> ", signedPsbt);
        const result = await updateSyndicateRequest(
          request._id,
          signedPsbt,
          paymentPublicKey
        );
        console.log("after update request result ==> ", result);
        if (result) {
          Notiflix.Notify.success(result.message);
          if (result.message == "Transaction broadcasting successfully.") {
            Notiflix.Notify.success(result.payload);
          }
          await fetchSyndicateRequest();
        }
      } catch (error) {
        console.log("reject sign on unisat ==> ", error);
        const result = await cancelSyndicateRequestPsbtController(
          request._id,
          paymentPublicKey
        );
        if (result.success) {
          Notiflix.Notify.success(result.message);
        } else {
          Notiflix.Notify.failure(result.message);
        }
        console.log("after cancel request result ==> ", result);
      }
    } else {
      Notiflix.Notify.failure(result.message);
    }
  };

  const fetchAirdropWallets = async () => {
    console.log("fetch airdrop wallets ==>");
    setLoading(true);
    const result = await fetchAirdropWalletsController();
    console.log("result ==> ", result);
    setAirdropWalletList(result);
    setLoading(false);
  };

  const fetchSyndicatepWallets = async () => {
    console.log("fetch syndicate wallets ==>");
    setLoading(true);
    const result = await fetchSyndicateWalletsController();
    console.log("syndicate result ==> ", result);
    setSyndicateWalletList(result.payload);
    setLoading(false);
  };

  const mintAirdropVault = async (wallet: IWalletList) => {
    console.log("mintAirdropVault functions ==> ");
    const result = await mintAirdropController(
      paymentAddress,
      paymentPublicKey,
      ordinalAddress,
      ordinalPublicKey,
      wallet._id
    );
    console.log("mintAirdropVault result ==> ", result);
    if (!result.success) {
      Notiflix.Notify.failure(result.message);
      return;
    }

    const toSignInputs = [];
    const clientInput = result.payload.clientInput;
    const serverInput = result.payload.serverInput;
    for (const index of clientInput) {
      toSignInputs.push({
        index: index,
        address: paymentAddress,
      });
    }
    console.log("toSignInputs ==> ", toSignInputs);
    const psbt = result.payload.psbtHex;

    const signedPsbt = await (window as any).unisat.signPsbt(psbt, {
      autoFinalized: false,
      toSignInputs,
    });

    console.log("signedPsbt ==> ", signedPsbt);
    const txId = await broadcastingController(
      psbt,
      signedPsbt,
      "Unisat",
      clientInput.length + serverInput.length,
      ordinalAddress,
      wallet._id
    );

    if (!txId.success) {
      Notiflix.Notify.failure(txId.message);
      Notiflix.Notify.info("Plz try again after a few minutes.");
    } else {
      Notiflix.Notify.success(txId.message);
      Notiflix.Notify.success(txId.payload);

      await fetchAirdropWallets();
    }
  };

  const mintSyndicateVault = async (wallet: IWalletList) => {
    console.log("mintSyndicateVault functions ==> ");
    const result = await mintSyndicateController(
      paymentAddress,
      paymentPublicKey,
      ordinalAddress,
      ordinalPublicKey,
      wallet._id
    );
    console.log("mintSyndicateVault result ==> ", result);
    if (!result.success) {
      Notiflix.Notify.failure(result.message);
      return;
    }

    const toSignInputs = [];
    const clientInput = result.payload.clientInput;
    const serverInput = result.payload.serverInput;
    for (const index of clientInput) {
      toSignInputs.push({
        index: index,
        address: paymentAddress,
      });
    }
    console.log("toSignInputs ==> ", toSignInputs);
    const psbt = result.payload.psbtHex;

    const signedPsbt = await (window as any).unisat.signPsbt(psbt, {
      autoFinalized: false,
      toSignInputs,
    });

    console.log("signedPsbt ==> ", signedPsbt);
    const txId = await broadcastingSyndicateController(
      psbt,
      signedPsbt,
      "Unisat",
      clientInput.length + serverInput.length,
      ordinalAddress,
      wallet._id
    );

    if (!txId.success) {
      Notiflix.Notify.failure(txId.message);
      Notiflix.Notify.info("Plz try again after a few minutes.");
    } else {
      Notiflix.Notify.success(txId.message);
      Notiflix.Notify.success(txId.payload);

      await fetchSyndicatepWallets();
    }
  };

  const assetsChangeHandler = async () => {
    setAssetsFlag((flag) => !flag);
  };

  // Batch Transfer
  const onBatchFunc = async () => {
    if (
      airdropAmountRef.current &&
      runeList &&
      selectedAirdropWallet &&
      batchOption
    ) {
      const unitAmount = (airdropAmountRef.current as any).value;
      // Notiflix.Notify.success(unitAmount);
      console.log(
        "limit ==> ",
        parseInt(runeList[batchIndex].amount) /
          selectedAirdropWallet?.edition.length
      );
      if (
        unitAmount >
        parseInt(runeList[batchIndex].amount) /
          selectedAirdropWallet?.edition.length
      ) {
        Notiflix.Notify.failure("Overload!!");
      } else {
        // Notiflix.Notify.success("Enough");
        console.log("selectedAirdropWallet Id ==> ", selectedAirdropWallet);
        console.log("unitAmount ==> ", unitAmount);
        console.log("BatchOption ==> ", runeList[batchIndex]);
        const result = await batchTransferController(
          selectedAirdropWallet._id,
          unitAmount,
          runeList[batchIndex].runeid
        );
        if (!result.success) {
          Notiflix.Notify.failure(result.payload);
        } else {
          const psbtHex = result.payload;
          const tempPsbt = Bitcoin.Psbt.fromHex(psbtHex);
          const inputCount = tempPsbt.inputCount;
          const toSignInputs = [];
          for (let i = 0; i < inputCount; i++) {
            toSignInputs.push({
              index: i,
              address: ordinalAddress,
            });
          }
          const signedPsbt = await (window as any).unisat.signPsbt(psbtHex, {
            autoFinalized: false,
            toSignInputs,
          });
          const txResult = await execPsbt(
            psbtHex,
            signedPsbt,
            WalletTypes.UNISAT
          );
          if (txResult.success) {
            Notiflix.Notify.success("Batch transfer successfully.");
            Notiflix.Notify.success(txResult.msg);
          } else {
          }
          console.log("txResult in batch result ==> ", txResult);
        }
      }
    }
  };

  const onSyndicateBatchFunc = async () => {
    if (
      syndicateAmountRef.current &&
      runeList &&
      selectedSyndicateWallet &&
      batchOption
    ) {
      const unitAmount = (syndicateAmountRef.current as any).value;
      // Notiflix.Notify.success(unitAmount);
      console.log(
        "limit ==> ",
        parseInt(runeList[batchIndex].amount) /
          selectedSyndicateWallet?.edition.length
      );
      if (
        unitAmount >
        parseInt(runeList[batchIndex].amount) /
          selectedSyndicateWallet?.edition.length
      ) {
        Notiflix.Notify.failure("Overload!!");
      } else {
        // Notiflix.Notify.success("Enough");
        console.log("selectedSyndicateWallet Id ==> ", selectedSyndicateWallet);
        console.log("unitAmount ==> ", unitAmount);
        console.log("BatchOption ==> ", runeList[batchIndex]);

        const result = await batchSyndicateTransferController(
          selectedSyndicateWallet._id,
          unitAmount,
          runeList[batchIndex].runeid,
          ordinalPublicKey
        );

        console.log("result ==> ", result);
        if (!result.success) {
          Notiflix.Notify.failure(result.message);
        }

        Notiflix.Notify.success(result.message);
        // else {
        //   const psbtHex = result.payload;
        //   const tempPsbt = Bitcoin.Psbt.fromHex(psbtHex);
        //   const inputCount = tempPsbt.inputCount;
        //   const toSignInputs = [];
        //   for (let i = 0; i < inputCount; i++) {
        //     toSignInputs.push({
        //       index: i,
        //       address: ordinalAddress,
        //     });
        //   }
        //   const signedPsbt = await (window as any).unisat.signPsbt(psbtHex, {
        //     autoFinalized: false,
        //     toSignInputs,
        //   });
        //   const txResult = await updateSyndicateRequest(
        //     selectedSyndicateWallet._id,
        //     signedPsbt,
        //     ordinalPublicKey
        //   );
        //   if (txResult.success) {
        //     Notiflix.Notify.success("Batch transfer successfully.");
        //     Notiflix.Notify.success(txResult.payload);
        //   } else {
        //     Notiflix.Notify.failure(txResult.message);
        //   }
        //   console.log("txResult in batch result ==> ", txResult);
        // }
      }
    }
  };
  // End

  // List

  const listModalOpen = async () => {
    setAvatar({
      preview: "",
    });
    const tempOption: ISelectOption[] = [];
    const runeAssets: IRuneDetail[] = await fetchRuneListByAddressController(
      ordinalAddress
    );
    console.log("airdrop wallet list ==> ", airdropWalletList);
    const pureTickerList = airdropWalletList?.map((airdrop) =>
      airdrop.assets.runeName.replaceAll(".", "").toLocaleUpperCase()
    );
    console.log("pureTickerList ==> ", pureTickerList);
    const runeAssetsTickerArray = runeAssets.map((elem) => elem.rune);
    console.log("runeAssetsTickerArray ==> ", runeAssetsTickerArray);
    // const allowedRuneList = pureTickerList?.filter((value) => runeAssets.map((elem) => elem.rune == value));
    const allowedRuneList = pureTickerList?.filter((value) =>
      runeAssets.map((elem) => elem.rune).includes(value)
    );
    console.log("allowedRuneList ==> ", allowedRuneList);
    if (!allowedRuneList || !allowedRuneList.length) {
      Notiflix.Notify.failure(
        "Can't find any edition rune tokens in your wallet."
      );
      return;
    }

    if (allowedRuneList.length) {
      setRuneList(runeAssets);
      console.log("runeAssets ==> ", runeAssets);
      allowedRuneList.map((runeName, index) => {
        tempOption.push({
          value: index,
          label: runeName,
        });
      });
      console.log("tempOption ==> ", tempOption);
      setModalFlag(BatchTypes.Airdrop);
      setBatchOption(tempOption);
      onOpen();
    } else {
      Notiflix.Notify.failure("No assets in this vault.");
    }
  };

  const onListFunc = async () => {
    if (!batchOption) return;
    const sellPrice = (sellPriceRef.current as any).value;
    if (!sellPrice) {
      Notiflix.Notify.failure("Price value is missing");
      return;
    }

    if (!fileInputOfListRef?.current?.files?.[0]!) {
      Notiflix.Notify.failure("The banner image is required.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInputOfListRef?.current?.files?.[0]!);

    const response = await fetch("/api/uploadImage", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    console.log("result ==> ", result);
    if (!result.success) {
      Notiflix.Notify.failure("Get error while uploading image.");
      return;
    }
    // return
    const imageUrl = result.payload;
    console.log("imageUrl ==> ", imageUrl);

    const selectedTickerName = batchOption[batchIndex];
    console.log("selectedTickerName ==> ", selectedTickerName);
    const listResult = await marketplaceListController(
      ordinalAddress,
      ordinalPublicKey,
      paymentAddress,
      paymentPublicKey,
      selectedTickerName.label,
      sellPrice,
      imageUrl
    );

    console.log("listResult ==>", listResult);
    fetchMarketplaceList();
  };

  const fetchMarketplaceList = async () => {
    setLoading(true);
    const result = await fetchListController();
    if (result.success) {
      Notiflix.Notify.success(result.message);
      console.log("result payload ==> ", result.payload);
      setList(result.payload);
    } else {
      Notiflix.Notify.failure(result.message);
    }
    setLoading(false);
  };

  const pre_buyList = async (listId: string) => {
    const result = await pre_buyListController(
      listId,
      ordinalAddress,
      ordinalPublicKey,
      paymentAddress,
      paymentPublicKey
    );

    console.log("Pre_buyList result in frontend ==> ", result);

    if (!result.success) {
      Notiflix.Notify.failure(result.message);
      return;
    }

    const psbtHex = result.payload.hex;
    const buyerInputs = result.payload.buyerInputs;
    const sellerInputs = result.payload.sellerInputs;
    const toSignInputs = [];
    for (let i = 0; i < buyerInputs.length; i++) {
      toSignInputs.push({
        index: buyerInputs[i],
        address: paymentAddress,
      });
    }
    const signedPsbt = await (window as any).unisat.signPsbt(psbtHex, {
      autoFinalized: false,
      toSignInputs,
    });
    const readyResult = await ready_buyListController(
      listId,
      ordinalAddress,
      ordinalPublicKey,
      paymentAddress,
      paymentPublicKey,
      signedPsbt,
      sellerInputs
    );
    if (readyResult.success) {
      Notiflix.Notify.success("Your reqeust Applied successfully.");
      Notiflix.Notify.success(readyResult.msg);
      fetchMarketplaceList();
    } else {
    }
    console.log("readyResult in batch result ==> ", readyResult);
  };

  const cancelMarketplace = async (listId: string) => {
    const result = await cancelMarketplceController(listId, ordinalAddress);
    console.log("result ==> ", result);
    fetchMarketplaceList();
  };

  const acceptMarketplace = async (marketplaceData: IList) => {
    const toSignInputs: { index: number; address: string }[] = [];
    const inputArray = marketplaceData.inputsArray;
    const psbt = marketplaceData.psbt;
    inputArray.map((value: number) =>
      toSignInputs.push({
        index: value,
        address: ordinalAddress,
      })
    );
    console.log("toSignInputs ==> ", toSignInputs);
    const signedPsbt = await (window as any).unisat.signPsbt(psbt, {
      autoFinalized: false,
      toSignInputs,
    });
    console.log("signedPsbt ==> ", signedPsbt);
    const result = await acceptMarketplceController(
      marketplaceData._id,
      ordinalAddress,
      psbt,
      signedPsbt,
      WalletTypes.UNISAT
    );
    console.log("result ==> ", result);
    if (result.success) {
      Notiflix.Notify.success(result.message);
      Notiflix.Notify.success(result.payload);
      fetchMarketplaceList();
    } else {
      Notiflix.Notify.failure(result.message);
    }
  };
  // End

  // Syndicate
  const listSyndicateModalOpen = async () => {
    setAvatar({
      preview: "",
    });
    const tempOption: ISelectOption[] = [];
    const runeAssets: IRuneDetail[] = await fetchRuneListByAddressController(
      ordinalAddress
    );
    console.log("syndicate wallet list ==> ", syndicateWalletList);
    const pureTickerList = syndicateWalletList?.map((syndicate) =>
      syndicate.assets.runeName.replaceAll(".", "").toLocaleUpperCase()
    );
    console.log("pureTickerList ==> ", pureTickerList);
    const runeAssetsTickerArray = runeAssets.map((elem) => elem.rune);
    console.log("runeAssetsTickerArray ==> ", runeAssetsTickerArray);
    // const allowedRuneList = pureTickerList?.filter((value) => runeAssets.map((elem) => elem.rune == value));
    const allowedRuneList = pureTickerList?.filter((value) =>
      runeAssets.map((elem) => elem.rune).includes(value)
    );
    console.log("allowedRuneList ==> ", allowedRuneList);
    if (!allowedRuneList || !allowedRuneList.length) {
      Notiflix.Notify.failure(
        "Can't find any edition rune tokens in your wallet."
      );
      return;
    }

    if (allowedRuneList.length) {
      setRuneList(runeAssets);
      console.log("runeAssets ==> ", runeAssets);
      allowedRuneList.map((runeName, index) => {
        tempOption.push({
          value: index,
          label: runeName,
        });
      });
      console.log("tempOption ==> ", tempOption);
      setModalFlag(BatchTypes.Syndicate);
      setBatchOption(tempOption);
      onOpen();
    } else {
      Notiflix.Notify.failure("No assets in this vault.");
    }
  };

  const onSyndicateListFunc = async () => {
    if (!batchOption) return;
    const sellPrice = (sellPriceRef.current as any).value;
    if (!sellPrice) {
      Notiflix.Notify.failure("Price value is missing");
      return;
    }

    if (!fileInputOfListRef?.current?.files?.[0]!) {
      Notiflix.Notify.failure("The banner image is required.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInputOfListRef?.current?.files?.[0]!);

    const response = await fetch("/api/uploadImage", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    console.log("result ==> ", result);
    if (!result.success) {
      Notiflix.Notify.failure("Get error while uploading image.");
      return;
    }
    // return
    const imageUrl = result.payload;
    console.log("imageUrl ==> ", imageUrl);

    const selectedTickerName = batchOption[batchIndex];
    console.log("batchOption ==> ", batchOption);
    console.log("batchIndex ==> ", batchIndex);
    console.log("selectedTickerName ==> ", selectedTickerName);
    const listResult = await marketplaceSyndicateListController(
      ordinalAddress,
      ordinalPublicKey,
      paymentAddress,
      paymentPublicKey,
      selectedTickerName.label,
      sellPrice,
      imageUrl
    );

    console.log("listResult ==>", listResult);
    fetchMarketplaceList();
  };

  const fetchSyndicateMarketplaceList = async () => {
    setLoading(true);
    const result = await fetchListController();
    if (result.success) {
      Notiflix.Notify.success(result.message);
      console.log("result payload ==> ", result.payload);
      setList(result.payload);
    } else {
      Notiflix.Notify.failure(result.message);
    }
    setLoading(false);
  };

  const syndicate_Pre_buyList = async (listId: string) => {
    const result = await pre_buySyndicateListController(
      listId,
      ordinalAddress,
      ordinalPublicKey,
      paymentAddress,
      paymentPublicKey
    );

    console.log("pre_buySyndicateListController result in frontend ==> ", result);

    if (!result.success) {
      Notiflix.Notify.failure(result.message);
      return;
    }

    const psbtHex = result.payload.hex;
    const buyerInputs = result.payload.buyerInputs;
    const sellerInputs = result.payload.sellerInputs;
    const toSignInputs = [];
    for (let i = 0; i < buyerInputs.length; i++) {
      toSignInputs.push({
        index: buyerInputs[i],
        address: paymentAddress,
      });
    }
    const signedPsbt = await (window as any).unisat.signPsbt(psbtHex, {
      autoFinalized: false,
      toSignInputs,
    });
    const readyResult = await ready_buySyndicateListController(
      listId,
      ordinalAddress,
      ordinalPublicKey,
      paymentAddress,
      paymentPublicKey,
      signedPsbt,
      sellerInputs
    );
    if (readyResult.success) {
      Notiflix.Notify.success("Your reqeust Applied successfully.");
      Notiflix.Notify.success(readyResult.msg);
      fetchMarketplaceList();
    } else {
    }
    console.log("readyResult in batch result ==> ", readyResult);
  };

  const cancelSyndicateMarketplace = async (listId: string) => {
    const result = await cancelSyndicateMarketplceController(listId, ordinalAddress);
    console.log("result ==> ", result);
    fetchMarketplaceList();
  };

  const acceptSyndicateMarketplace = async (marketplaceData: IList) => {
    console.log("acceptSyndicateMarketplace ===> ");
    const toSignInputs: { index: number; address: string }[] = [];
    const inputArray = marketplaceData.inputsArray;
    const psbt = marketplaceData.psbt;
    inputArray.map((value: number) =>
      toSignInputs.push({
        index: value,
        address: ordinalAddress,
      })
    );
    console.log("toSignInputs ==> ", toSignInputs);
    const signedPsbt = await (window as any).unisat.signPsbt(psbt, {
      autoFinalized: false,
      toSignInputs,
    });
    console.log("signedPsbt ==> ", signedPsbt);
    const result = await acceptSyndicateMarketplceController(
      marketplaceData._id,
      ordinalAddress,
      psbt,
      signedPsbt,
      WalletTypes.UNISAT
    );
    console.log("result ==> ", result);
    if (result.success) {
      Notiflix.Notify.success(result.message);
      Notiflix.Notify.success(result.payload);
      fetchMarketplaceList();
    } else {
      Notiflix.Notify.failure(result.message);
    }
  };
  // End Syndicate

  // Connect wallet
  const [hash, setHash] = useState("");
  const unisatConnectWallet = async () => {
    try {
      const currentWindow: any = window;
      if (typeof currentWindow?.unisat !== "undefined") {
        const unisat: any = currentWindow?.unisat;
        try {
          let accounts: string[] = await unisat.requestAccounts();
          let pubkey = await unisat.getPublicKey();

          let res = await unisat.signMessage(SIGN_MESSAGE);
          setHash(res);

          const tempWalletType = WalletTypes.UNISAT;
          const tempOrdinalAddress = accounts[0];
          const tempPaymentAddress = accounts[0];
          const tempOrdinalPublicKey = pubkey;
          const tempPaymentPublicKey = pubkey;

          const savedHash = await walletConnect(
            tempPaymentAddress,
            tempPaymentPublicKey,
            tempOrdinalAddress,
            tempOrdinalPublicKey,
            tempWalletType,
            res
          );

          if (savedHash.success) {
            Notiflix.Notify.success("Connect succes!");
            setWalletType(WalletTypes.UNISAT);
            setOrdinalAddress(accounts[0] || "");
            setPaymentAddress(accounts[0] || "");
            setOrdinalPublicKey(pubkey);
            setPaymentPublicKey(pubkey);

            onClose();
          } else {
            Notiflix.Notify.failure("No match hash!");
          }
        } catch (e: any) {
          console.log("unisat wallet error ==> ", e);
          if (e.message) {
            Notiflix.Notify.failure(e.message);
          } else {
            Notiflix.Notify.failure("Connect failed!");
          }
        }
      } else {
        Notiflix.Notify.failure("Plz install wallet extention first!");
      }
    } catch (error) {
      console.log("unisatConnectWallet error ==> ", error);
    }
  };

  const xverseConnectWallet = async () => {
    try {
      if (!(window as any).XverseProviders) {
        Notiflix.Notify.failure("Plz install wallet extention first!");
      }
      await getAddress({
        payload: {
          purposes: [
            AddressPurpose.Ordinals,
            AddressPurpose.Payment,
            AddressPurpose.Stacks,
          ],
          message: "Welcome Co-vault",
          network: {
            type: BitcoinNetworkType.Testnet,
          },
        },
        onFinish: async (response) => {
          const paymentAddressItem = response.addresses.find(
            (address) => address.purpose === AddressPurpose.Payment
          );
          const ordinalsAddressItem = response.addresses.find(
            (address) => address.purpose === AddressPurpose.Ordinals
          );

          let tempWalletType = WalletTypes.XVERSE;
          let tempOrdinalAddress = ordinalsAddressItem?.address as string;
          let tempPaymentAddress = paymentAddressItem?.address as string;
          let tempOrdinalPublicKey = ordinalsAddressItem?.publicKey as string;
          let tempPaymentPublicKey = paymentAddressItem?.publicKey as string;

          let res = "";
          await signMessage({
            payload: {
              network: {
                type: BitcoinNetworkType.Testnet,
              },
              address: paymentAddressItem?.address as string,
              message: "Sign in Co-vault",
            },
            onFinish: (response: any) => {
              // signature
              res = response;
              return response;
            },
            onCancel: () => alert("Canceled"),
          });

          const savedHash = await walletConnect(
            tempPaymentAddress,
            tempPaymentPublicKey,
            tempOrdinalAddress,
            tempOrdinalPublicKey,
            tempWalletType,
            res
          );

          if (savedHash.success) {
            Notiflix.Notify.success("Connect succes!");
            setWalletType(WalletTypes.XVERSE);
            setPaymentAddress(paymentAddressItem?.address as string);
            setPaymentPublicKey(paymentAddressItem?.publicKey as string);
            setOrdinalAddress(ordinalsAddressItem?.address as string);
            setOrdinalPublicKey(ordinalsAddressItem?.publicKey as string);

            onClose();
          } else {
            Notiflix.Notify.failure("No match hash!");
          }
        },
        onCancel: () => alert("Request canceled"),
      });
    } catch (error) {
      console.log("xverseConnectWallet error ==> ", error);
    }
  };
  // End

  // CopyHandler
  const clipboard = useClipboard();
  const onCopyClipboard = (str: string | undefined) => {
    if (!str) return;
    Notiflix.Notify.success("Copied to clipboard.");
    clipboard.copy(str);
  };
  // End

  // Syndicate
  const batchModalOpenForSyndicate = async (wallet: IAirdropWalletList) => {
    setSelectedSyndicateWallet(wallet);
    console.log("wallet.edition ==> ", wallet);
    const tempOption: ISelectOption[] = [];
    const runeAssets = await fetchRuneListByAddressController(wallet.address);
    if (runeAssets.length) {
      setRuneList(runeAssets);
      console.log("runeAssets ==> ", runeAssets);
      runeAssets.map((rune: IRuneDetail, index: number) => {
        tempOption.push({
          value: index,
          label: rune.spacedRune,
        });
      });
      console.log("tempOption ==> ", tempOption);
      setBatchOption(tempOption);
      setModalFlag(BatchTypes.Syndicate);
      onOpen();
    } else {
      Notiflix.Notify.failure("No assets in this vault.");
    }
  };
  // End

  useEffect(() => {
    if (paymentAddress) fetchWallets();
  }, [paymentAddress]);

  useEffect(() => {
    if (paymentAddress)
      switch (pageIndex) {
        case 0:
          fetchWallets();
          break;
        case 3:
          fetchRequestList();
          fetchSyndicateRequest();
          break;
        case 4:
          fetchAirdropWallets();
          fetchMarketplaceList();
          fetchSyndicatepWallets();
          break;
        default:
          break;
      }
    setNewVault("");
  }, [pageIndex]);

  useEffect(() => {
    setNewVault("");
  }, [selected]);

  // useEffect(() => {
  //   console.log("editionSelected ==> ", editionSelected);
  //   if (editionSelected == "sell") {
  //     fetchMarketplaceList();
  //   } else {
  //     fetchAirdropWallets();
  //   }

  //   if (editionSelected2 == "sell") {
  //     fetchMarketplaceList();
  //   } else {
  //     fetchSyndicatepWallets();
  //   }
  // }, [editionSelected, editionSelected2]);

  useEffect(() => {
    console.log("Fetch Airdrop vault...");
    if (editionSelected == "sell") {
      fetchMarketplaceList();
    } else {
      fetchAirdropWallets();
    }
  }, [editionSelected]);

  useEffect(() => {
    console.log("Fetch Syndicate vault...");
    if (editionSelected2 == "sell") {
      fetchSyndicateMarketplaceList();
    } else {
      fetchSyndicatepWallets();
    }
  }, [editionSelected2]);

  return (
    <>
      <div className="flex w-full justify-center items-center">
        <img src="bg1.png" className="brightness-150"></img>
      </div>
      <div className="absolute z-10 w-full top-32 left-0 p-2 pb-20 bg-[#131416] min-h-screen">
        {isConnected ? (
          <></>
        ) : (
          <div className="mx-auto mt-28 w-[450px] h-[450px] bg-gradient-to-br from-[#6D757F] via-[#28292c] to-[#1C1D1F] p-[2px] rounded-xl">
            {!modalOpen ? (
              <div className="w-full h-full flex flex-col gap-2 items-center bg-[#1C1D1F] rounded-xl">
                <img
                  src="wallet_connect_logo.png"
                  className="mx-auto mt-10 "
                ></img>
                <div className="flex flex-row items-center text-white gap-2 text-[24px]">
                  <p>WELCOME TO</p>
                  <img src="logo2.png" className="brightness-150"></img>
                  <p>COVAULT</p>
                </div>
                <p className="text-gray-600 text-[18px]">
                  Connect to your Bitcoin wallet
                </p>
                <div
                  className="flex flex-row border-1 border-[#FEE505] py-3 px-5 text-[#FEE505] rounded-xl items-center gap-4 hover:brightness-150 duration-300 cursor-pointer mt-20"
                  onClick={onConnectWalletOpen}
                >
                  <SlWallet />
                  Connect Wallet
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col gap-3 items-center bg-[#1C1D1F] rounded-xl p-6">
                <div className="flex flex-col text-white text-[30px] mt-4 mb-10">
                  <p className="text-center">Connect to your</p>
                  <p className="text-center">Bitcoin wallet</p>
                </div>
                <div
                  className="flex flex-row justify-between rounded-2xl w-full p-2 bg-[#131416] cursor-pointer hover:brightness-125 duration-300"
                  onClick={unisatConnectWallet}
                >
                  <div className="flex flex-row gap-2 p-2 items-center">
                    <img src="wallet/unisat.png"></img>
                    <p className="text-white text-[20px]">Unisat</p>
                  </div>
                  {(window as any).unisat ? (
                    <div className="py-1 px-3 bg-[#28292C] text-gray-500 rounded-2xl text-center my-auto ml-auto mr-36">
                      • Installed
                    </div>
                  ) : (
                    <a
                      className="py-3 px-5 bg-[#28292C] text-white rounded-2xl text-center my-auto"
                      href="https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo"
                      target="_blank"
                    >
                      Install
                    </a>
                  )}
                </div>

                <div
                  className="flex flex-row justify-between rounded-2xl w-full p-2 bg-[#131416] cursor-pointer hover:brightness-125 duration-300"
                  onClick={xverseConnectWallet}
                >
                  <div className="flex flex-row gap-2 p-2 items-center">
                    <img src="wallet/xverse.png"></img>
                    <p className="text-white text-[20px]">Xverse</p>
                  </div>
                  {(window as any).XverseProviders ? (
                    <div className="py-1 px-3 bg-[#28292C] text-gray-500 rounded-2xl text-center my-auto ml-auto mr-36">
                      • Installed
                    </div>
                  ) : (
                    <a
                      className="py-3 px-5 bg-[#28292C] text-white rounded-2xl text-center my-auto"
                      href="https://chromewebstore.google.com/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg"
                      target="_blank"
                    >
                      Install
                    </a>
                  )}
                </div>

                <div className="flex flex-row justify-between rounded-2xl w-full p-2 bg-[#131416]">
                  <div className="flex flex-row gap-2 p-2 items-center">
                    <img src="wallet/leather.png"></img>
                    <p className="text-white text-[20px]">Leather</p>
                  </div>
                  {(window as any).LeatherProvider ? (
                    <div className="py-1 px-3 bg-[#28292C] text-gray-500 rounded-2xl text-center my-auto ml-auto mr-36">
                      • Installed
                    </div>
                  ) : (
                    <a
                      className="py-3 px-5 bg-[#28292C] text-white rounded-2xl text-center my-auto"
                      href="https://chromewebstore.google.com/detail/leather/ldinpeekobnhjjdofggfgjlcehhmanlj"
                      target="_blank"
                    >
                      Install
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {isConnected && (
          <div className="mt-10">
            {/* Dashboard - Wallet List */}
            {pageIndex == 0 ? (
              <div className="flex flex-wrap mx-4 items-start justify-between pt-4 gap-4">
                {walletList?.length ? (
                  walletList.map((wallet: IWalletList, index: number) => (
                    <div
                      className="flex flex-col gap-3 w-[450px] px-6 rounded-3xl border-2 border-[#2C2C2C] bg-[#1C1D1F] p-4 text-white"
                      key={index + "wallet"}
                    >
                      <div className="flex flex-row gap-4 pb-5 border-b-2 border-b-[#28292C] items-center">
                        <img
                          className="rounded-full p-2 border-2 border-[#28292C] w-[50px] h-[50px]"
                          src={
                            wallet.imageUrl
                              ? `/uploads/${wallet.imageUrl}`
                              : "/multi-vault.png"
                          }
                        ></img>
                        <div className="flex flex-col truncate">
                          <p>Vault address</p>
                          <div className="flex flex-row gap-2 items-center">
                            <p className="text-[#FEE505] font-bold truncate underline underline-offset-4">
                              {wallet.address}
                            </p>
                            <MdOutlineContentCopy
                              size={36}
                              className="text-[#5C636C] hover:text-white duration-300 cursor-pointer"
                              onClick={() => onCopyClipboard(wallet.address)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row justify-between mt-4">
                        <p className="mr-10">Cosigners: </p>
                        {wallet.cosigner.map((cosigner, index) => (
                          <div
                            className="truncate bg-[#28292C] ml-2 rounded-xl px-2"
                            key={"cosinger" + index}
                          >
                            {cosigner}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-row justify-between">
                        <p>Threshold:</p>
                        <p>{wallet.threshold}</p>
                      </div>
                      <div className="flex flex-row justify-between pb-6 border-b-2 border-[#2C2C2C] mb-4">
                        <p>CreatedAt:</p>
                        <p>{wallet.createdAt.split("T")[0]}</p>
                      </div>
                      <div
                        className="w-full rounded-lg p-[2px] bg-gradient-to-b from-[#6B737D] to-[#1C1D1F] cursor-pointer hover:brightness-150 duration-300"
                        onClick={() => updateHandler(wallet)}
                      >
                        <div className="flex bg-[#28292C] justify-center items-center h-full rounded-lg py-2">
                          <p className="text-white text-center align-middle">
                            Update
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>No Vault here</>
                )}
              </div>
            ) : (
              <></>
            )}

            {/* Create New vault */}
            {pageIndex == 1 ? (
              <div className="flex flex-col w-full">
                <div className="max-w-full min-[640px]:w-[644px] max-[640px]:w-[594px] py-[2px] bg-gradient-to-br from-[#6D757F] via-[#28292C] to-[#28292C] mx-auto rounded-xl">
                  <Card className="max-w-full min-[640px]:w-[640px] max-[640px]:w-[590px] mx-auto bg-[#1C1D1F] p-3">
                    <CardBody className="overflow-hidden">
                      <Tabs
                        fullWidth
                        size="md"
                        aria-label="Tabs form"
                        selectedKey={selected}
                        // @ts-ignore
                        onSelectionChange={setSelected}
                        variant="bordered"
                        classNames={{
                          tabList:
                            "gap-6 w-full relative rounded-none p-0 border-b border-divider bg-[#131416] p-1 rounded-2xl",
                          cursor: "w-full bg-[#262515] border border-[#C3B109]",
                          tabContent:
                            "group-data-[selected=true]:text-[#FEE505] text-white",
                        }}
                      >
                        <Tab
                          key="multi"
                          title={
                            <div className="flex flex-row items-center gap-4">
                              <FaVault />
                              <p>New Vault</p>
                            </div>
                          }
                        >
                          <div className="flex flex-col items-center justify-between pt-4">
                            <div className="flex flex-col gap-2 bg-[#1C1D1F] mx-auto  min-[640px]:w-[600px] max-[640px]:w-[550px] rounded-xl p-3 ">
                              <div className="flex flex-row justify-center px-4 py-2">
                                <h3 className="text-[24px] font-manrope text-white leading-8">
                                  Create New vault
                                </h3>
                              </div>
                              <div className="flex flex-col">
                                <div className="flex flex-col gap-4">
                                  <div className="flex flex-col gap-3 ">
                                    <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                      Vault Type
                                    </label>
                                    <RadioGroup
                                      value={typeSelected}
                                      onValueChange={setTypeSelected}
                                      className="ml-4"
                                    >
                                      <Radio value="NativeSegwit">
                                        <p className="text-white">
                                          Native Segwit
                                        </p>
                                      </Radio>
                                      <Radio value="Taproot">
                                        <p className="text-white">Taproot</p>
                                      </Radio>
                                    </RadioGroup>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                      Co-signer
                                    </label>
                                    <textarea
                                      className="bg-[#131416] border-2 border-[#28292C] p-3 rounded-xl text-white"
                                      placeholder="Add co-signer wallet address"
                                      ref={coSignerRef}
                                      onChange={() => onChangeHandler()}
                                    />

                                    {err ? (
                                      <p className="text-red-600">
                                        {err.cosigner}
                                      </p>
                                    ) : (
                                      <></>
                                    )}
                                    <label className="font-manrope text-[14px] font-normal leading-6 text-gray-500">
                                      input vault address then press space to
                                      add
                                    </label>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                      Threshold vaule
                                    </label>
                                    <div className="flex flex-row items-center gap-4">
                                      <div className="flex flex-row items-center gap-2 bg-[#131416] border-2 border-[#28292C] rounded-xl focus:outline-none">
                                        <div
                                          className="w-[40px] h-[40px] flex justify-center items-center cursor-pointer hover:brightness-150 duration-300"
                                          onClick={() =>
                                            changeCosignerHandler(-1)
                                          }
                                        >
                                          <FaMinus color="gray" size={20} />
                                        </div>
                                        <p className="text-white text-center w-[200px]">
                                          {coSigner}
                                        </p>

                                        <div
                                          className="w-[40px] h-[40px] flex justify-center items-center cursor-pointer hover:brightness-150 duration-300"
                                          onClick={() =>
                                            changeCosignerHandler(1)
                                          }
                                        >
                                          <FaPlus color="gray" size={20} />
                                        </div>
                                      </div>
                                      <p className="text-white min-w-[600px]">
                                        Out of {coSignerCount} co-signer
                                      </p>
                                    </div>

                                    {err ? (
                                      <p className="text-red-600">
                                        {err.thresHold}
                                      </p>
                                    ) : (
                                      <></>
                                    )}
                                    <label className="font-manrope text-[14px] font-normal leading-6 text-gray-500">
                                      Number of co-signer to confirm any
                                      transaction
                                    </label>

                                    <Checkbox
                                      radius="lg"
                                      onChange={() => assetsChangeHandler()}
                                      className="mt-4 mb-2"
                                      isSelected={assetsFlag}
                                    >
                                      <p className="text-white">
                                        Use Rune as DAO token?
                                      </p>
                                    </Checkbox>
                                    {assetsFlag ? (
                                      <div className="flex flex-row justify-between gap-4 pt-4 border-t-2 border-[#28292C]">
                                        <div className="flex flex-col justify-center gap-1">
                                          <p className="text-white text-center">
                                            Upload Image
                                          </p>
                                          <input
                                            type="file"
                                            style={{ display: "none" }}
                                            id="upload-button"
                                            ref={fileInput}
                                            accept="image/*"
                                            onChange={uploadFile}
                                          />
                                          <label htmlFor="upload-button">
                                            {avatar.preview ? (
                                              <img
                                                src={avatar.preview}
                                                alt="dummy"
                                                width="160px"
                                                height="160px"
                                                className=""
                                              />
                                            ) : (
                                              <div className="flex flex-col gap-1 rounded-xl bg-[#28292C] w-40 h-40 justify-center items-center hover:brightness-150 duration-300 cursor-pointer">
                                                <AiOutlineUpload
                                                  color="white"
                                                  size={26}
                                                />
                                                <p className="text-white">
                                                  Upload
                                                </p>
                                              </div>
                                            )}
                                          </label>
                                        </div>
                                        <div className="flex flex-col gap-2 w-full pl-4 border-l-2 border-[#28292C]">
                                          <div className="flex flex-col gap-1">
                                            <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                              RuneName
                                            </label>
                                            <input
                                              name="RuneName"
                                              className="bg-[#16171B] rounded-xl p-2 gap-2 placeholder:text-gray-600 text-white focus:outline-none border-2 border-[#28292C]"
                                              placeholder="UNCOMMONGOODS"
                                              ref={runeNameRef}
                                              onChange={() => onChangeHandler()}
                                            />
                                          </div>
                                          <div className="flex flex-col gap-1">
                                            <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                              Rune Amount
                                            </label>
                                            <input
                                              name="RuneAmount"
                                              className="bg-[#16171B] rounded-xl p-2 gap-2 placeholder:text-gray-600 text-white focus:outline-none border-2 border-[#28292C]"
                                              placeholder="5000"
                                              ref={runeAmountRef}
                                              onChange={() => onChangeHandler()}
                                            />
                                          </div>
                                          <div className="flex flex-col gap-1">
                                            <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                              Rune Price
                                            </label>
                                            <input
                                              name="initialPrice"
                                              className="bg-[#16171B] rounded-xl p-2 gap-2 placeholder:text-gray-600 text-white focus:outline-none border-2 border-[#28292C]"
                                              placeholder="5000"
                                              ref={runePriceRef}
                                              onChange={() => onChangeHandler()}
                                            />
                                          </div>
                                          <div className="flex flex-col gap-1">
                                            <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                              Rune Symbol
                                            </label>
                                            <input
                                              name="RuneSymbol"
                                              className="bg-[#16171B] rounded-xl p-2 gap-2 placeholder:text-gray-600 text-white focus:outline-none border-2 border-[#28292C]"
                                              placeholder="5000"
                                              ref={runeSymbolRef}
                                              onChange={() => onChangeHandler()}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <></>
                                    )}
                                  </div>
                                </div>

                                <button
                                  className="bg-[#FEE505] rounded-xl px-6 py-3 w-full hover:brightness-150 duration-300 mt-10"
                                  type="submit"
                                  onClick={() => onCreateNewWallet()}
                                >
                                  <div className="flex flex-row gap-4 items-center justify-center">
                                    <FaVault />
                                    <p className="text-black font-manrope text-[14px] font-semibold leading-6 ">
                                      Create New Vault
                                    </p>
                                  </div>
                                </button>
                                {transactionID ? (
                                  <a
                                    href={`https://mempool.space/testnet/tx/${transactionID}`}
                                  />
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>

                            {newVault ? (
                              <div className="text-white flex flex-col w-11/12">
                                <p className="truncate text-center">
                                  created vault address
                                </p>
                                <p>{newVault}</p>
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </Tab>
                        <Tab
                          key="airdrop"
                          title={
                            <div className="flex flex-row items-center gap-4">
                              <SiVaultwarden />
                              <p>Airdrop Vault</p>
                            </div>
                          }
                        >
                          <div className="flex flex-col items-center justify-between pt-4">
                            <div className="flex flex-col gap-2 bg-[#1C1D1F] mx-auto min-[640px]:w-[580px] max-[640px]:w-[530px] rounded-xl">
                              <div className="flex flex-row justify-center px-2 py-2">
                                <h3 className="text-[24px] font-manrope text-white leading-8">
                                  Create New Airdrop vault
                                </h3>
                              </div>
                              <div className="flex flex-col w-full gap-4">
                                <div className="flex flex-col gap-3 ">
                                  <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                    Vault Type
                                  </label>
                                  <RadioGroup
                                    value={typeSelected}
                                    onValueChange={setTypeSelected}
                                    className="ml-4"
                                  >
                                    <Radio value="NativeSegwit">
                                      <p className="text-white">
                                        Native Segwit
                                      </p>
                                    </Radio>
                                    <Radio value="Taproot">
                                      <p className="text-white">Taproot</p>
                                    </Radio>
                                  </RadioGroup>
                                </div>
                                <div className="flex flex-row gap-4 w-full">
                                  <div className="flex flex-col mx-auto w-1/3 gap-2">
                                    <p className="text-white text-center">Upload Image</p>
                                    <input
                                      type="file"
                                      style={{ display: "none" }}
                                      id="upload-button"
                                      ref={fileInput}
                                      accept="image/*"
                                      onChange={uploadFile}
                                    />
                                    <label htmlFor="upload-button">
                                      {avatar.preview ? (
                                        <img
                                          src={avatar.preview}
                                          alt="dummy"
                                          width="160px"
                                          height="160px"
                                          className=""
                                        />
                                      ) : (
                                        <div className="flex flex-col gap-1 rounded-xl bg-[#28292C] w-40 h-40 justify-center items-center hover:brightness-150 duration-300 cursor-pointer">
                                          <AiOutlineUpload
                                            color="white"
                                            size={26}
                                          />
                                          <p className="text-white">Upload</p>
                                        </div>
                                      )}
                                    </label>
                                  </div>
                                  <div className="flex flex-col gap-2 border-l-2 pl-4 ml-2 border-[#28292C] w-2/3">
                                    <div className="flex flex-col gap-1">
                                      <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                        RuneName
                                      </label>
                                      <input
                                        name="RuneName"
                                        className="bg-[#131416] border-2 border-[#28292C] p-2 rounded-lg text-white"
                                        placeholder="UNCOMMONGOODS"
                                        ref={runeNameRef}
                                        onChange={() => onChangeHandler()}
                                      />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                        Rune Amount
                                      </label>
                                      <input
                                        name="RuneAmount"
                                        className="bg-[#131416] border-2 border-[#28292C] p-2 rounded-lg text-white"
                                        placeholder="5000"
                                        ref={runeAmountRef}
                                        onChange={() => onChangeHandler()}
                                      />
                                    </div>
                                    <div className="flex flex-row gap-4 w-full items-center justify-between">
                                      <div className="flex flex-col gap-1 w-2/3">
                                        <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                          Rune Price
                                        </label>
                                        <input
                                          name="initialPrice"
                                          className="bg-[#131416] border-2 border-[#28292C] p-2 rounded-lg text-white"
                                          placeholder="5000"
                                          ref={runePriceRef}
                                          onChange={() => onChangeHandler()}
                                        />
                                      </div>
                                      <div className="flex flex-col w-1/4">
                                        <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                          Rune Symbol
                                        </label>
                                        <input
                                          name="RuneSymbol"
                                          className="bg-[#131416] border-2 border-[#28292C] p-2 rounded-lg text-white"
                                          placeholder="$"
                                          ref={runeSymbolRef}
                                          onChange={() => onChangeHandler()}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  className="bg-[#FEE505] rounded-xl px-6 py-3 w-full hover:brightness-150 duration-300 mt-4"
                                  type="submit"
                                  onClick={() => onCreateNewAirdropWallet()}
                                >
                                  <p className="text-black font-manrope text-[18px] font-semibold leading-6 ">
                                    Submit
                                  </p>
                                </button>
                                {transactionID ? (
                                  <a
                                    href={`https://mempool.space/testnet/tx/${transactionID}`}
                                  />
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>

                            {newVault ? (
                              <div className="text-white flex flex-col w-11/12">
                                <p className="truncate text-center">
                                  created vault address
                                </p>
                                <p>{newVault}</p>
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </Tab>
                        <Tab
                          key="syndicate"
                          title={
                            <div className="flex flex-row items-center gap-4">
                              <ImShield />
                              <p>Syndicate Vault</p>
                            </div>
                          }
                        >
                          <div className="flex flex-col items-center justify-between pt-4">
                            <div className="flex flex-col gap-2 bg-[#1C1D1F] mx-auto  min-[640px]:w-[600px] max-[640px]:w-[550px] rounded-xl p-3 ">
                              <div className="flex flex-row justify-center px-4 py-2">
                                <h3 className="text-[24px] font-manrope text-white leading-8">
                                  Create New Syndicate Vault
                                </h3>
                              </div>
                              <div className="flex flex-col">
                                <div className="flex flex-col gap-3 ">
                                  <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                    Vault Type
                                  </label>
                                  <RadioGroup
                                    value={typeSelected}
                                    onValueChange={setTypeSelected}
                                    className="ml-4"
                                  >
                                    <Radio value="NativeSegwit">
                                      <p className="text-white">
                                        Native Segwit
                                      </p>
                                    </Radio>
                                    <Radio value="Taproot">
                                      <p className="text-white">Taproot</p>
                                    </Radio>
                                  </RadioGroup>
                                </div>
                                <div className="flex flex-col gap-4">
                                  <div className="flex flex-col gap-1">
                                    <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                      Co-signer
                                    </label>
                                    <textarea
                                      className="bg-[#131416] border-2 border-[#28292C] p-3 rounded-xl text-white"
                                      placeholder="Add co-signer wallet address"
                                      ref={coSignerRef}
                                      onChange={() => onChangeHandler()}
                                    />

                                    {err ? (
                                      <p className="text-red-600">
                                        {err.cosigner}
                                      </p>
                                    ) : (
                                      <></>
                                    )}
                                    <label className="font-manrope text-[14px] font-normal leading-6 text-gray-500">
                                      input vault address then press space to
                                      add
                                    </label>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                      Threshold vaule
                                    </label>
                                    <div className="flex flex-row items-center gap-4">
                                      <div className="flex flex-row items-center gap-2 bg-[#131416] border-2 border-[#28292C] rounded-xl focus:outline-none">
                                        <div
                                          className="w-[40px] h-[40px] flex justify-center items-center cursor-pointer hover:brightness-150 duration-300"
                                          onClick={() =>
                                            changeCosignerHandler(-1)
                                          }
                                        >
                                          <FaMinus color="gray" size={20} />
                                        </div>
                                        <p className="text-white text-center w-[200px]">
                                          {coSigner}
                                        </p>

                                        <div
                                          className="w-[40px] h-[40px] flex justify-center items-center cursor-pointer hover:brightness-150 duration-300"
                                          onClick={() =>
                                            changeCosignerHandler(1)
                                          }
                                        >
                                          <FaPlus color="gray" size={20} />
                                        </div>
                                      </div>
                                      <p className="text-white min-w-[600px]">
                                        Out of {coSignerCount} co-signer
                                      </p>
                                    </div>

                                    {err ? (
                                      <p className="text-red-600">
                                        {err.thresHold}
                                      </p>
                                    ) : (
                                      <></>
                                    )}
                                    <label className="font-manrope text-[14px] font-normal leading-6 text-gray-500">
                                      Number of co-signer to confirm any
                                      transaction
                                    </label>

                                    <Checkbox
                                      radius="lg"
                                      onChange={() => assetsChangeHandler()}
                                      className="mt-4 mb-2"
                                      isSelected={assetsFlag}
                                    >
                                      <p className="text-white">
                                        Use Rune as DAO token?
                                      </p>
                                    </Checkbox>
                                    {assetsFlag ? (
                                      <div className="flex flex-row justify-between gap-4 pt-4 border-t-2 border-[#28292C]">
                                        <div className="flex flex-col mx-auto gap-1">
                                          <p className="text-white text-center">
                                            Upload Image
                                          </p>
                                          <input
                                            type="file"
                                            style={{ display: "none" }}
                                            id="upload-button"
                                            ref={fileInput}
                                            accept="image/*"
                                            onChange={uploadFile}
                                          />
                                          <label htmlFor="upload-button">
                                            {avatar.preview ? (
                                              <img
                                                src={avatar.preview}
                                                alt="dummy"
                                                width="160px"
                                                height="160px"
                                                className=""
                                              />
                                            ) : (
                                              <div className="flex flex-col gap-1 rounded-xl bg-[#28292C] w-40 h-40 justify-center items-center hover:brightness-150 duration-300 cursor-pointer">
                                                <AiOutlineUpload
                                                  color="white"
                                                  size={26}
                                                />
                                                <p className="text-white">
                                                  Upload
                                                </p>
                                              </div>
                                            )}
                                          </label>
                                        </div>
                                        <div className="flex flex-col gap-2 w-full pl-4 border-l-2 border-[#28292C]">
                                          <div className="flex flex-col gap-1">
                                            <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                              RuneName
                                            </label>
                                            <input
                                              name="RuneName"
                                              className="bg-[#16171B] rounded-xl p-2 gap-2 placeholder:text-gray-600 text-white focus:outline-none border-2 border-[#28292C]"
                                              placeholder="UNCOMMONGOODS"
                                              ref={runeNameRef}
                                              onChange={() => onChangeHandler()}
                                            />
                                          </div>
                                          <div className="flex flex-col gap-1">
                                            <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                              Rune Amount
                                            </label>
                                            <input
                                              name="RuneAmount"
                                              className="bg-[#16171B] rounded-xl p-2 gap-2 placeholder:text-gray-600 text-white focus:outline-none border-2 border-[#28292C]"
                                              placeholder="5000"
                                              ref={runeAmountRef}
                                              onChange={() => onChangeHandler()}
                                            />
                                          </div>
                                          <div className="flex flex-col gap-1">
                                            <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                              Rune Price
                                            </label>
                                            <input
                                              name="initialPrice"
                                              className="bg-[#16171B] rounded-xl p-2 gap-2 placeholder:text-gray-600 text-white focus:outline-none border-2 border-[#28292C]"
                                              placeholder="5000"
                                              ref={runePriceRef}
                                              onChange={() => onChangeHandler()}
                                            />
                                          </div>
                                          <div className="flex flex-col gap-1">
                                            <label className="font-manrope text-[14px] font-normal leading-6 text-white">
                                              Rune Symbol
                                            </label>
                                            <input
                                              name="RuneSymbol"
                                              className="bg-[#16171B] rounded-xl p-2 gap-2 placeholder:text-gray-600 text-white focus:outline-none border-2 border-[#28292C]"
                                              placeholder="5000"
                                              ref={runeSymbolRef}
                                              onChange={() => onChangeHandler()}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <></>
                                    )}
                                  </div>
                                </div>

                                <button
                                  className="bg-[#FEE505] rounded-xl px-6 py-3 w-full hover:brightness-150 duration-300 mt-10"
                                  type="submit"
                                  onClick={() => onCreateNewSyndicateVault()}
                                >
                                  <div className="flex flex-row gap-4 items-center justify-center">
                                    <FaVault />
                                    <p className="text-black font-manrope text-[14px] font-semibold leading-6 ">
                                      Create New Syndicate vault
                                    </p>
                                  </div>
                                </button>
                                {transactionID ? (
                                  <a
                                    href={`https://mempool.space/testnet/tx/${transactionID}`}
                                  />
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>

                            {newVault ? (
                              <div className="text-white flex flex-col w-11/12">
                                <p className="truncate text-center">
                                  created Vault address
                                </p>
                                <p>{newVault}</p>
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </Tab>
                      </Tabs>
                    </CardBody>
                  </Card>
                </div>
              </div>
            ) : (
              <></>
            )}

            {/* Upgrade exist vault */}
            {pageIndex == 2 ? (
              <div className="max-w-full min-[640px]:w-[644px] max-[640px]:w-[594px] py-[2px] bg-gradient-to-br from-[#6D757F] via-[#28292C] to-[#28292C] mx-auto rounded-xl">
                <div className="max-w-full min-[640px]:w-[640px] max-[640px]:w-[590px] mx-auto bg-[#1C1D1F] p-6 rounded-xl">
                  <div className="flex flex-row justify-center px-4 py-5">
                    <h3 className="text-[24px]  font-bold font-manrope text-white leading-8">
                      Update vault
                    </h3>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-row justify-between">
                          <label className="font-manrope text-[14px] font-normal leading-6 text-gray-200">
                            Address:
                          </label>
                          <div className="flex flex-row gap-2 items-center">
                            <p className="w-48 underline underline-offset-4 text-yellow-400 truncate">
                              {" "}
                              {selectedVault?.address}
                            </p>
                            <MdOutlineContentCopy
                              color="gray"
                              className="hover:brightness-150 duration-300 cursor-pointer"
                              onClick={() =>
                                onCopyClipboard(selectedVault?.address)
                              }
                            />
                          </div>
                        </div>
                        <div className="flex flex-row justify-between">
                          <label className="font-manrope text-[14px] font-normal leading-6 text-gray-200">
                            Previous Threshold:
                          </label>
                          <p className="text-gray-400">
                            {" "}
                            {selectedVault?.threshold}
                          </p>
                        </div>
                        <div className="flex flex-row justify-between pb-4 border-b-2 border-[#28292C]">
                          <label className="font-manrope text-[14px] font-normal leading-6 text-gray-200">
                            Previous Co-signer: {` `}{" "}
                          </label>
                          <div className="flex flex-col gap-1 text-gray-400">
                            {selectedVault?.cosigner.map((vault, index) => (
                              <div
                                className="flex flex-row items-center"
                                key={"selectedVault" + index}
                              >
                                <div className="truncate w-48">{vault}</div>
                                <MdOutlineContentCopy
                                  color="gray"
                                  className="hover:brightness-150 duration-300 cursor-pointer"
                                  onClick={() => onCopyClipboard(vault)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <label className="font-manrope text-[18px] font-normal leading-6 text-[#ffffff] mt-5 mr-auto">
                          Update Vault
                        </label>
                        <label className="font-manrope text-[14px] font-normal leading-6 text-gray-200 mt-3">
                          New Co-signer
                        </label>
                        <textarea
                          name="Cosigner"
                          className="bg-[#131416] border-2 border-[#28292C] p-3 rounded-xl text-white "
                          placeholder="ex. 3Eb9zqd..."
                          // ref={newCosigner}
                          ref={coSignerRef}
                          onChange={() => onChangeHandler()}
                        />

                        {err ? (
                          <p className="text-red-600">{err.cosigner}</p>
                        ) : (
                          <></>
                        )}
                      </div>

                      {/* <div className="flex flex-col gap-1">
                        <label className="font-manrope text-[14px] font-normal leading-6 text-gray-200 mt-3">
                          Threshold vaule
                        </label>
                        <input
                          name="threshold"
                          className="bg-[#16171B] rounded-xl px-4 py-3 gap-2 placeholder:text-gray-600 text-white focus:outline-none "
                          placeholder="ex. 3Eb9zqd..."
                          ref={newThresHold}
                          onChange={() => onChangeHandler()}
                        />
                        {err ? (
                          <p className="text-red-600">{err.thresHold}</p>
                        ) : (
                          <></>
                        )}
                      </div> */}
                      <div className="flex flex-row items-center gap-4">
                        <label className="font-manrope text-[14px] font-normal leading-6 text-gray-200 mt-3">
                          New Co-signer
                        </label>
                        <div className="flex flex-row items-center gap-2 bg-[#131416] border-2 border-[#28292C] rounded-xl focus:outline-none">
                          <div
                            className="w-[40px] h-[40px] flex justify-center items-center cursor-pointer hover:brightness-150 duration-300"
                            onClick={() => changeCosignerHandler(-1)}
                          >
                            <FaMinus color="gray" size={20} />
                          </div>
                          <p className="text-white text-center w-[200px]">
                            {coSigner}
                          </p>

                          <div
                            className="w-[40px] h-[40px] flex justify-center items-center cursor-pointer hover:brightness-150 duration-300"
                            onClick={() => changeCosignerHandler(1)}
                          >
                            <FaPlus color="gray" size={20} />
                          </div>
                        </div>
                        <p className="text-white min-w-[600px]">
                          Out of {coSignerCount} co-signer
                        </p>
                      </div>
                      <div className="flex flex-col mx-auto gap-1">
                        <p className="text-white text-center">Upload Image</p>
                        <input
                          type="file"
                          style={{ display: "none" }}
                          id="upload-button"
                          ref={fileInput}
                          accept="image/*"
                          onChange={uploadFile}
                        />
                        <label htmlFor="upload-button">
                          {avatar.preview ? (
                            <img
                              src={avatar.preview}
                              alt="dummy"
                              width="160px"
                              height="160px"
                              className=""
                            />
                          ) : (
                            <div className="flex flex-col gap-1 rounded-xl bg-[#28292C] w-40 h-40 justify-center items-center hover:brightness-150 duration-300 cursor-pointer">
                              <AiOutlineUpload color="white" size={26} />
                              <p className="text-white">Upload</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <button
                      className="bg-[#FEE505] rounded-xl px-6 py-3 w-full hover:brightness-150 duration-300 mt-4"
                      type="submit"
                      onClick={() => updateWallet()}
                    >
                      <p className="text-black font-manrope text-[14px] font-semibold leading-6 ">
                        Update Vault
                      </p>
                    </button>
                    {transactionID ? (
                      <Link
                        href={`https://mempool.space/testnet/tx/${transactionID}`}
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
                <div>
                  {newVault ? "created vault address :" + newVault : ""}
                </div>
              </div>
            ) : (
              <></>
            )}

            {/* Sign request */}
            {pageIndex == 3 ? (
              <div className="flex flex-col gap-10">
                <p className="w-full text-center text-4xl text-yellow-300">
                  Multisig Updating & Airdrop Request
                </p>
                <div className="flex flex-wrap mx-4 items-start justify-between pt-4 gap-4">
                  {requestList?.length ? (
                    requestList.map((request: IRequest, index: number) => (
                      <div className="max-w-full min-[640px]:w-[494px] max-[640px]:w-[454px] py-[2px] bg-gradient-to-br from-[#6D757F] via-[#28292C] to-[#28292C] mx-auto rounded-xl text-white">
                        <div className="flex flex-col gap-2 max-w-full min-[640px]:w-[490px] max-[640px]:w-[440px] mx-auto bg-[#1C1D1F] p-6 rounded-xl">
                          <div className="text-white text-[20px] text-center mb-6">
                            Syndicate Request
                          </div>
                          <div className="flex flex-row justify-between">
                            <label className="font-manrope text-[14px] font-normal leading-6 text-gray-200">
                              Type
                            </label>
                            <label>{request.type}</label>
                          </div>
                          <div className="flex flex-row justify-between">
                            <label className="font-manrope text-[14px] font-normal leading-6 text-gray-200">
                              Previous Co-signer: {` `}{" "}
                            </label>
                            <div className="flex flex-col gap-1 text-gray-400">
                              {request.cosigner.map((cosigner, index) => (
                                <div
                                  className="flex flex-row items-center"
                                  key={"request" + index}
                                >
                                  <div className="truncate w-48">
                                    {cosigner}
                                  </div>
                                  <MdOutlineContentCopy
                                    color="gray"
                                    className="hover:brightness-150 duration-300 cursor-pointer"
                                    onClick={() => onCopyClipboard(cosigner)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-row justify-between">
                            <label className="font-manrope text-[14px] font-normal leading-6 text-gray-200">
                              Signed Co-signer: {` `}{" "}
                            </label>
                            <div className="flex flex-col gap-1 text-gray-400">
                              {request.signedCosigner.map((cosigner, index) => (
                                <div
                                  className="flex flex-row items-center"
                                  key={"request" + index}
                                >
                                  <div className="truncate w-48">
                                    {cosigner}
                                  </div>
                                  <MdOutlineContentCopy
                                    color="gray"
                                    className="hover:brightness-150 duration-300 cursor-pointer"
                                    onClick={() => onCopyClipboard(cosigner)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-row justify-between">
                            <label className="font-manrope text-[14px] font-normal leading-6 text-gray-200">
                              Creator: {` `}{" "}
                            </label>
                            <div
                              className="flex flex-row items-center text-gray-400"
                              key={"request" + index}
                            >
                              <div className="truncate w-48">
                                {request.creator}
                              </div>
                              <MdOutlineContentCopy
                                color="gray"
                                className="hover:brightness-150 duration-300 cursor-pointer"
                                onClick={() => onCopyClipboard(request.creator)}
                              />
                            </div>
                          </div>
                          <div className="pb-4 mb-4 border-b-2 border-[#28292C]">
                            Threshold: {request.threshold}
                          </div>
                          <div
                            className="w-2/5 border-[#FEE505] text-center bg-[#2E2D1D] p-2 rounded-lg mt-auto mx-auto border cursor-pointer hover:brightness-150 duration-300"
                            onClick={() => updateRequestHandler(request)}
                          >
                            Sign
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center text-white text-xl pb-20 mb-4 border-b-2 border-gray-600">
                      No airdrop request...
                    </div>
                  )}
                </div>
                <p className="w-full text-center text-4xl text-yellow-300">
                  Syndicate Request
                </p>
                <div className="flex flex-wrap mx-4 items-start justify-start pt-4 gap-4">
                  {syndicateRequestList?.length ? (
                    syndicateRequestList.map(
                      (request: IRequest, index: number) => (
                        <div className="max-w-full min-[640px]:w-[494px] max-[640px]:w-[454px] py-[2px] bg-gradient-to-br from-[#6D757F] via-[#28292C] to-[#28292C] mx-auto rounded-xl text-white">
                          <div className="flex flex-col gap-2 max-w-full min-[640px]:w-[490px] max-[640px]:w-[440px] mx-auto bg-[#1C1D1F] p-6 rounded-xl">
                            <div className="text-white text-[20px] text-center mb-6">
                              Syndicate Request
                            </div>
                            <div className="flex flex-row justify-between">
                              <label className="font-manrope text-[14px] font-normal leading-6 text-gray-200">
                                Type
                              </label>
                              <label>{request.type}</label>
                            </div>
                            <div className="flex flex-row justify-between">
                              <label className="font-manrope text-[14px] font-normal leading-6 text-gray-200">
                                Previous Co-signer: {` `}{" "}
                              </label>
                              <div className="flex flex-col gap-1 text-gray-400">
                                {request.cosigner.map((cosigner, index) => (
                                  <div
                                    className="flex flex-row items-center"
                                    key={"request" + index}
                                  >
                                    <div className="truncate w-48">
                                      {cosigner}
                                    </div>
                                    <MdOutlineContentCopy
                                      color="gray"
                                      className="hover:brightness-150 duration-300 cursor-pointer"
                                      onClick={() => onCopyClipboard(cosigner)}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-row justify-between">
                              <label className="font-manrope text-[14px] font-normal leading-6 text-gray-200">
                                Signed Co-signer: {` `}{" "}
                              </label>
                              <div className="flex flex-col gap-1 text-gray-400">
                                {request.signedCosigner.map(
                                  (cosigner, index) => (
                                    <div
                                      className="flex flex-row items-center"
                                      key={"request" + index}
                                    >
                                      <div className="truncate w-48">
                                        {cosigner}
                                      </div>
                                      <MdOutlineContentCopy
                                        color="gray"
                                        className="hover:brightness-150 duration-300 cursor-pointer"
                                        onClick={() =>
                                          onCopyClipboard(cosigner)
                                        }
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="flex flex-row justify-between">
                              <label className="font-manrope text-[14px] font-normal leading-6 text-gray-200">
                                Creator: {` `}{" "}
                              </label>
                              <div
                                className="flex flex-row items-center text-gray-400"
                                key={"request" + index}
                              >
                                <div className="truncate w-48">
                                  {request.creator}
                                </div>
                                <MdOutlineContentCopy
                                  color="gray"
                                  className="hover:brightness-150 duration-300 cursor-pointer"
                                  onClick={() =>
                                    onCopyClipboard(request.creator)
                                  }
                                />
                              </div>
                            </div>
                            <div className="pb-4 mb-4 border-b-2 border-[#28292C]">
                              Threshold: {request.threshold}
                            </div>
                            <div
                              className="w-2/5 border-[#FEE505] text-center bg-[#2E2D1D] p-2 rounded-lg mt-auto mx-auto border cursor-pointer hover:brightness-150 duration-300"
                              onClick={() =>
                                updateSyndicateRequestHandler(request)
                              }
                            >
                              Sign
                            </div>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="w-full text-center text-white text-xl">
                      No Syndicate request...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <></>
            )}

            {/* Airdrop vault mint */}
            {pageIndex == 4 ? (
              <div className="flex flex-col gap-10">
                <>
                  <div className="flex flex-row gap-4">
                    <div className="flex w-full flex-row px-10 items-center">
                      {editionSelected == "mint" ? (
                        <div>
                          <p className="text-white text-[24px] font-bold text-center">
                            Airdrop edition mint:{" "}
                            {airdropWalletList ? airdropWalletList.length : 0}
                          </p>
                        </div>
                      ) : (
                        <p className="text-white text-[25px] font-bold text-center">
                          Airdrop edition selling
                        </p>
                      )}
                      <Tabs
                        aria-label="Options"
                        selectedKey={editionSelected}
                        // @ts-ignore
                        onSelectionChange={setEditionSelected}
                        className="ml-auto mr-4"
                        classNames={{
                          tabList:
                            "gap-6 w-full relative rounded-none p-0 border-b border-divider bg-[#131416] p-1 rounded-2xl",
                          cursor: "w-full bg-[#262515] border border-[#C3B109]",
                          tabContent:
                            "group-data-[selected=true]:text-[#FEE505] text-white",
                        }}
                      >
                        <Tab key="mint" title="Airdrop Edition Mint"></Tab>
                        <Tab key="sell" title="Airdrop Edition Selling"></Tab>
                      </Tabs>
                      <Button
                        color="warning"
                        variant="bordered"
                        isDisabled={editionSelected == "mint" ? true : false}
                        onClick={() => listModalOpen()}
                      >
                        Sell edition vault
                      </Button>
                    </div>
                  </div>
                  {editionSelected == "mint" ? (
                    <div className="flex flex-wrap mx-4 items-start justify-around gap-4">
                      {airdropWalletList?.length ? (
                        airdropWalletList.map(
                          (wallet: IAirdropWalletList, index: number) => (
                            <div
                              className="flex flex-col gap-3 w-[450px] px-6 rounded-3xl border-2 border-[#2C2C2C] bg-[#1C1D1F] p-4 text-white"
                              key={index + "wallet"}
                            >
                              <div className="flex flex-row gap-4 pb-5 border-b-2 border-b-[#28292C] items-center">
                                <img
                                  className="rounded-full p-2 border-2 border-[#28292C] w-[80px] h-[80px]"
                                  src={
                                    wallet.imageUrl
                                      ? `/uploads/${wallet.imageUrl}`
                                      : "/multi-vault.png"
                                  }
                                ></img>
                                <div className="flex flex-col truncate">
                                  <p>Vault address</p>
                                  <div className="flex flex-row gap-2 items-center">
                                    <p className="text-[#FEE505] font-bold truncate underline underline-offset-4">
                                      {wallet.address}
                                    </p>
                                    <MdOutlineContentCopy
                                      size={36}
                                      className="text-[#5C636C] hover:text-white duration-300 cursor-pointer"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-row justify-between">
                                <p>RuneName:</p>
                                <p>{wallet.assets.runeName}</p>
                              </div>
                              <div className="flex flex-row justify-between">
                                <p>Rune Price:</p>
                                <p>{wallet.assets.initialPrice} sats</p>
                              </div>
                              <div className="flex flex-row justify-between">
                                <p>Rune Symbol:</p>
                                <p>{wallet.assets.runeSymbol}</p>
                              </div>
                              <div className="flex flex-row justify-between mt-4 pb-6 border-b-2 border-[#2C2C2C] mb-4">
                                <p className="mr-10">Editions: </p>
                                {wallet.edition.map((edition, index) => (
                                  <div
                                    className="truncate bg-[#28292C] ml-2 rounded-xl px-2"
                                    key={"cosinger" + index}
                                  >
                                    {edition}
                                  </div>
                                ))}
                              </div>
                              <div className="flex flex-row justify-around gap-4 mt-2 mb-2">
                                {!wallet.edition.includes(ordinalAddress) ? (
                                  <div
                                    className="w-2/5 rounded-lg p-2 border-2 border-[#FEE505] bg-[#2E2D1D] justify-center items-center cursor-pointer hover:brightness-150 duration-300"
                                    onClick={() => mintAirdropVault(wallet)}
                                  >
                                    <p className="text-[#FEE505] text-center">
                                      Mint
                                    </p>
                                  </div>
                                ) : (
                                  <div className="w-2/5 rounded-lg p-2 border-2 border-[#FEE505] bg-[#2E2D1D] justify-center items-center cursor-not-allowed brightness-50 duration-300">
                                    <p className="text-gray-400 text-center">
                                      Mint
                                    </p>
                                  </div>
                                )}
                                {wallet.creator.ordinalAddress ==
                                ordinalAddress ? (
                                  <div
                                    className="w-2/5 rounded-lg p-[2px] bg-gradient-to-b from-[#6B737D] to-[#1C1D1F] cursor-pointer hover:brightness-150 duration-300"
                                    onClick={() => batchModalOpen(wallet)}
                                  >
                                    <div className="flex bg-[#28292C] justify-center items-center h-full rounded-lg py-2">
                                      <p className="text-white text-center align-middle">
                                        Batch Transfer
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <>No vault here</>
                      )}
                    </div>
                  ) : (
                    <>
                      {list && list.length ? (
                        <div className="flex flex-wrap justify-around gap-6">
                          {list.map((elem, index) => (
                            <div
                              className="flex flex-col gap-3 w-[450px] px-6 rounded-3xl border-2 border-[#2C2C2C] bg-[#1C1D1F] p-4 text-white"
                              key={"marketplace" + index}
                            >
                              <div className="flex flex-row items-center gap-4 pb-5 border-b-2 border-b-[#28292C]">
                                <img
                                  className="rounded-full p-2 border-2 border-[#28292C] w-[80px] h-[80px]"
                                  src={
                                    elem.imageUrl
                                      ? `/uploads/${elem.imageUrl}`
                                      : "/logo.png"
                                  }
                                ></img>
                                <div className="flex flex-col gap-1 truncate">
                                  <p>Parent vault address</p>
                                  <div className="flex flex-row gap-2 items-center">
                                    <p className="text-[#FEE505] font-bold truncate underline underline-offset-4">
                                      {elem.parentAddress}
                                    </p>
                                    <MdOutlineContentCopy
                                      size={36}
                                      className="text-[#5C636C] hover:text-white duration-300 cursor-pointer"
                                      onClick={() =>
                                        onCopyClipboard(elem.parentAddress)
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                              <p className="truncate">
                                Seller Address: {elem.sellerInfo.ordinalAddress}
                              </p>
                              <p>RuneId: {elem.runeId}</p>
                              <p>Rune Ticker: {elem.runeTicker}</p>
                              <p>SellPrice: {elem.sellPrice} sats</p>
                              <p>createdAt: {elem.createdAt.split("T")[0]}</p>
                              <div className="flex flex-row justify-around gap-4 mt-8 mb-2">
                                {elem.psbt &&
                                elem.sellerInfo.ordinalAddress ==
                                  ordinalAddress &&
                                elem.status == "Ready" ? (
                                  <div
                                    className="w-2/5 rounded-lg p-2 border-2 border-[#a078fc] bg-[#1d222e] justify-center items-center cursor-pointer hover:brightness-150 duration-300"
                                    onClick={() => acceptMarketplace(elem)}
                                  >
                                    <p className="text-white text-center">
                                      Accept
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {elem.psbt &&
                                elem.buyerInfo.ordinalAddress ==
                                  ordinalAddress ? (
                                  <div
                                    className="w-2/5 rounded-lg p-2 border-2 border-[#fe0505] bg-[#6d1f1f] justify-center items-center cursor-pointer hover:brightness-150 duration-300"
                                    onClick={() => cancelMarketplace(elem._id)}
                                  >
                                    <p className="text-[#ffffff] text-center">
                                      Cancel
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {!elem.psbt &&
                                elem.sellerInfo.ordinalAddress !=
                                  ordinalAddress ? (
                                  <div
                                    className="w-2/5 rounded-lg p-2 border-2 border-[#FEE505] bg-[#2E2D1D] justify-center items-center cursor-pointer hover:brightness-150 duration-300"
                                    onClick={() => pre_buyList(elem._id)}
                                  >
                                    <p className="text-[#FEE505] text-center">
                                      Buy
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {elem.status == "End" ? (
                                  <div className="w-2/5 rounded-lg p-2 border-2 border-[#303030] bg-[#242424] justify-center items-center cursor-not-allowed hover:brightness-150 duration-300">
                                    <p className="text-gray-600 text-center">
                                      Sold
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <></>
                      )}
                    </>
                  )}
                </>
              </div>
            ) : (
              <></>
            )}

            {/* Syndicate vault mint */}
            {pageIndex == 4 ? (
              <div className="flex flex-col gap-10 mt-20">
                <>
                  <div className="flex flex-row gap-4">
                    <div className="flex w-full flex-row px-10 items-center">
                      {editionSelected2 == "mint" ? (
                        <div>
                          <p className="text-white text-[24px] font-bold text-center">
                            Syndicate edition mint:{" "}
                            {syndicateWalletList
                              ? syndicateWalletList.length
                              : 0}
                          </p>
                        </div>
                      ) : (
                        <p className="text-white text-[25px] font-bold text-center">
                          Syndicate edition selling
                        </p>
                      )}
                      <Tabs
                        aria-label="Options"
                        selectedKey={editionSelected2}
                        // @ts-ignore
                        onSelectionChange={setEditionSelected2}
                        className="ml-auto mr-4"
                        classNames={{
                          tabList:
                            "gap-6 w-full relative rounded-none p-0 border-b border-divider bg-[#131416] p-1 rounded-2xl",
                          cursor: "w-full bg-[#262515] border border-[#C3B109]",
                          tabContent:
                            "group-data-[selected=true]:text-[#FEE505] text-white",
                        }}
                      >
                        <Tab key="mint" title="Syndicate Edition Mint"></Tab>
                        <Tab key="sell" title="Syndicate Edition Selling"></Tab>
                      </Tabs>
                      <Button
                        color="warning"
                        variant="bordered"
                        isDisabled={editionSelected2 == "mint" ? true : false}
                        onClick={() => listSyndicateModalOpen()}
                      >
                        Sell edition vault
                      </Button>
                    </div>
                  </div>
                  {editionSelected2 == "mint" ? (
                    <div className="flex flex-wrap mx-4 items-start justify-around gap-4">
                      {syndicateWalletList?.length ? (
                        syndicateWalletList.map(
                          (wallet: IAirdropWalletList, index: number) => (
                            <div
                              className="flex flex-col gap-3 w-[450px] px-6 rounded-3xl border-2 border-[#2C2C2C] bg-[#1C1D1F] p-4 text-white"
                              key={index + "wallet"}
                            >
                              <div className="flex flex-row gap-4 pb-5 border-b-2 border-b-[#28292C] items-center">
                                <img
                                  className="rounded-full p-2 border-2 border-[#28292C] w-[80px] h-[80px]"
                                  src={
                                    wallet.imageUrl
                                      ? `/uploads/${wallet.imageUrl}`
                                      : "/multi-vault.png"
                                  }
                                ></img>
                                <div className="flex flex-col truncate">
                                  <p>Vault address</p>
                                  <div className="flex flex-row gap-2 items-center">
                                    <p className="text-[#FEE505] font-bold truncate underline underline-offset-4">
                                      {wallet.address}
                                    </p>
                                    <MdOutlineContentCopy
                                      size={36}
                                      className="text-[#5C636C] hover:text-white duration-300 cursor-pointer"
                                      onClick={() =>
                                        onCopyClipboard(wallet.address)
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-row justify-between">
                                <p>RuneName:</p>
                                <p>{wallet.assets.runeName}</p>
                              </div>
                              <div className="flex flex-row justify-between">
                                <p>Rune Price:</p>
                                <p>{wallet.assets.initialPrice} sats</p>
                              </div>
                              <div className="flex flex-row justify-between">
                                <p>Rune Symbol:</p>
                                <p>{wallet.assets.runeSymbol}</p>
                              </div>
                              <div className="flex flex-row justify-between mt-4">
                                <p className="mr-10">Cosigners: </p>
                                {wallet.cosigner.map((cosigner, index) => (
                                  <div
                                    className="truncate bg-[#28292C] ml-2 rounded-xl px-2"
                                    key={"cosinger" + index}
                                  >
                                    {cosigner}
                                  </div>
                                ))}
                              </div>
                              <div className="flex flex-row justify-between mt-4 pb-6 border-b-2 border-[#2C2C2C] mb-4">
                                <p className="mr-10">Editions: </p>
                                {wallet.edition.map((edition, index) => (
                                  <div
                                    className="truncate bg-[#28292C] ml-2 rounded-xl px-2"
                                    key={"cosinger" + index}
                                  >
                                    {edition}
                                  </div>
                                ))}
                              </div>
                              <div className="flex flex-row justify-around gap-4 mt-2 mb-2">
                                {!wallet.edition.includes(ordinalAddress) ? (
                                  <div
                                    className="w-2/5 rounded-lg p-2 border-2 border-[#FEE505] bg-[#2E2D1D] justify-center items-center cursor-pointer hover:brightness-150 duration-300"
                                    onClick={() => mintSyndicateVault(wallet)}
                                  >
                                    <p className="text-[#FEE505] text-center">
                                      Mint
                                    </p>
                                  </div>
                                ) : (
                                  <div className="w-2/5 rounded-lg p-2 border-2 border-[#FEE505] bg-[#2E2D1D] justify-center items-center cursor-not-allowed brightness-50 duration-300">
                                    <p className="text-gray-400 text-center">
                                      Mint
                                    </p>
                                  </div>
                                )}
                                {wallet.cosigner.includes(ordinalPublicKey) ? (
                                  <div
                                    className="w-2/5 rounded-lg p-[2px] bg-gradient-to-b from-[#6B737D] to-[#1C1D1F] cursor-pointer hover:brightness-150 duration-300"
                                    onClick={() =>
                                      batchModalOpenForSyndicate(wallet)
                                    }
                                  >
                                    <div className="flex bg-[#28292C] justify-center items-center h-full rounded-lg py-2">
                                      <p className="text-white text-center align-middle">
                                        Batch Transfer
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <>No vault here</>
                      )}
                    </div>
                  ) : (
                    <>
                      {list && list.length ? (
                        <div className="flex flex-wrap justify-around gap-6">
                          {list.map((elem, index) => (
                            <div
                              className="flex flex-col gap-3 w-[450px] px-6 rounded-3xl border-2 border-[#2C2C2C] bg-[#1C1D1F] p-4 text-white"
                              key={"marketplace" + index}
                            >
                              <div className="flex flex-row items-center gap-4 pb-5 border-b-2 border-b-[#28292C]">
                                <img
                                  className="rounded-full p-2 border-2 border-[#28292C] w-[80px] h-[80px]"
                                  src={
                                    elem.imageUrl
                                      ? `/uploads/${elem.imageUrl}`
                                      : "/logo.png"
                                  }
                                ></img>
                                <div className="flex flex-col gap-1 truncate">
                                  <p>Parent vault address</p>
                                  <div className="flex flex-row gap-2 items-center">
                                    <p className="text-[#FEE505] font-bold truncate underline underline-offset-4">
                                      {elem.parentAddress}
                                    </p>
                                    <MdOutlineContentCopy
                                      size={36}
                                      className="text-[#5C636C] hover:text-white duration-300 cursor-pointer"
                                      onClick={() =>
                                        onCopyClipboard(elem.parentAddress)
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                              <p className="truncate">
                                Seller Address: {elem.sellerInfo.ordinalAddress}
                              </p>
                              <p>RuneId: {elem.runeId}</p>
                              <p>Rune Ticker: {elem.runeTicker}</p>
                              <p>SellPrice: {elem.sellPrice} sats</p>
                              <p>createdAt: {elem.createdAt.split("T")[0]}</p>
                              <div className="flex flex-row justify-around gap-4 mt-8 mb-2">
                                {elem.psbt &&
                                elem.sellerInfo.ordinalAddress ==
                                  ordinalAddress &&
                                elem.status == "Ready" ? (
                                  <div
                                    className="w-2/5 rounded-lg p-2 border-2 border-[#a078fc] bg-[#1d222e] justify-center items-center cursor-pointer hover:brightness-150 duration-300"
                                    onClick={() => acceptSyndicateMarketplace(elem)}
                                  >
                                    <p className="text-white text-center">
                                      Accept
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {elem.psbt &&
                                elem.buyerInfo.ordinalAddress ==
                                  ordinalAddress ? (
                                  <div
                                    className="w-2/5 rounded-lg p-2 border-2 border-[#fe0505] bg-[#6d1f1f] justify-center items-center cursor-pointer hover:brightness-150 duration-300"
                                    onClick={() => cancelSyndicateMarketplace(elem._id)}
                                  >
                                    <p className="text-[#ffffff] text-center">
                                      Cancel
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {!elem.psbt &&
                                elem.sellerInfo.ordinalAddress !=
                                  ordinalAddress ? (
                                  <div
                                    className="w-2/5 rounded-lg p-2 border-2 border-[#FEE505] bg-[#2E2D1D] justify-center items-center cursor-pointer hover:brightness-150 duration-300"
                                    onClick={() => syndicate_Pre_buyList(elem._id)}
                                  >
                                    <p className="text-[#FEE505] text-center">
                                      Buy
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                {elem.status == "End" ? (
                                  <div className="w-2/5 rounded-lg p-2 border-2 border-[#303030] bg-[#242424] justify-center items-center cursor-not-allowed hover:brightness-150 duration-300">
                                    <p className="text-gray-600 text-center">
                                      Sold
                                    </p>
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <></>
                      )}
                    </>
                  )}
                </>
              </div>
            ) : (
              <></>
            )}

            {loading ? <Loading /> : <></>}
            {/* Airdrop Modal */}
            <Modal
              backdrop="blur"
              isOpen={isOpen && modalFlag == BatchTypes.Ready}
              onClose={onClose}
              motionProps={{
                variants: {
                  enter: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.3,
                      ease: "easeOut",
                    },
                  },
                  exit: {
                    y: -20,
                    opacity: 0,
                    transition: {
                      duration: 0.2,
                      ease: "easeIn",
                    },
                  },
                },
              }}
              classNames={{
                body: "py-6",
                backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
                header: "border-b-[1px] border-[#292f46]",
                footer: "border-t-[1px] border-[#292f46]",
                closeButton: "hover:bg-white/5 active:bg-white/10",
              }}
            >
              <ModalContent>
                {() => (
                  <>
                    <ModalHeader className="flex flex-col gap-1 text-center">
                      Batch airdrop in Airdrop
                    </ModalHeader>
                    <ModalBody>
                      <div className="p-2">
                        {runeList ? (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-row gap-5 items-center">
                              <p>Rune Ticker: </p>
                              {batchOption ? (
                                <Select
                                  options={batchOption}
                                  onChange={(values) =>
                                    setBatchIndex(values[0].value)
                                  }
                                  className="w-full"
                                  values={[batchOption[0]]}
                                />
                              ) : (
                                <></>
                              )}
                            </div>
                            <div className="flex flex-row gap-5 items-center">
                              <p className="mr-7">Balance: </p>
                              <p>{runeList[batchIndex].amount}</p>
                            </div>
                            <div className="flex flex-row gap-5 items-center">
                              <p className="">UnitAmount </p>
                              <Input
                                type="number"
                                variant="underlined"
                                className="text-white text-[20px]"
                                color="primary"
                                ref={airdropAmountRef}
                                placeholder="200"
                                max={runeList[batchIndex].amount}
                                onChange={() => onChangeHandler()}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <p className="">
                                Edition: {selectedAirdropWallet?.edition.length}{" "}
                              </p>
                              <div className="flex flex-col gap-2 max-h-[150px] overflow-auto">
                                {selectedAirdropWallet?.edition.map(
                                  (edition: string, index: number) => (
                                    <div
                                      className="flex flex-row gap-2"
                                      key={"edition" + index}
                                    >
                                      <p className="indent-2">{index}: </p>
                                      <p className="truncate">{edition}</p>
                                    </div>
                                  )
                                )}
                              </div>
                              {err ? (
                                <p className="text-red-600">{err.thresHold}</p>
                              ) : (
                                <></>
                              )}
                            </div>
                            <Button
                              color="warning"
                              variant="flat"
                              onPress={onBatchFunc}
                              className="capitalize mt-4"
                            >
                              Batch Transfer
                            </Button>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
            {/* Syndicate Modal */}
            <Modal
              backdrop="blur"
              isOpen={isOpen && modalFlag == BatchTypes.Syndicate}
              onClose={onClose}
              motionProps={{
                variants: {
                  enter: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.3,
                      ease: "easeOut",
                    },
                  },
                  exit: {
                    y: -20,
                    opacity: 0,
                    transition: {
                      duration: 0.2,
                      ease: "easeIn",
                    },
                  },
                },
              }}
              classNames={{
                body: "py-6",
                backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
                header: "border-b-[1px] border-[#292f46]",
                footer: "border-t-[1px] border-[#292f46]",
                closeButton: "hover:bg-white/5 active:bg-white/10",
              }}
            >
              <ModalContent>
                {() => (
                  <>
                    <ModalHeader className="flex flex-col gap-1 text-center">
                      Batch airdrop in Syndicate
                    </ModalHeader>
                    <ModalBody>
                      <div className="p-2">
                        {runeList ? (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-row gap-5 items-center">
                              <p>Rune Ticker: </p>
                              {batchOption ? (
                                <Select
                                  options={batchOption}
                                  onChange={(values) =>
                                    setBatchIndex(values[0].value)
                                  }
                                  className="w-full"
                                  values={[batchOption[0]]}
                                />
                              ) : (
                                <></>
                              )}
                            </div>
                            <div className="flex flex-row gap-5 items-center">
                              <p className="mr-7">Balance: </p>
                              <p>{runeList[batchIndex].amount}</p>
                            </div>
                            <div className="flex flex-row gap-5 items-center">
                              <p className="">UnitAmount </p>
                              <Input
                                type="number"
                                variant="underlined"
                                className="text-white text-[20px]"
                                color="primary"
                                ref={syndicateAmountRef}
                                placeholder="200"
                                max={runeList[batchIndex].amount}
                                onChange={() => onChangeHandler()}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <p className="">
                                Edition:{" "}
                                {selectedSyndicateWallet?.edition.length}{" "}
                              </p>
                              <div className="flex flex-col gap-2 max-h-[150px] overflow-auto">
                                {selectedSyndicateWallet?.edition.map(
                                  (edition: string, index: number) => (
                                    <div
                                      className="flex flex-row gap-2"
                                      key={"edition" + index}
                                    >
                                      <p className="indent-2">{index}: </p>
                                      <p className="truncate">{edition}</p>
                                    </div>
                                  )
                                )}
                              </div>
                              {err ? (
                                <p className="text-red-600">{err.thresHold}</p>
                              ) : (
                                <></>
                              )}
                            </div>
                            <Button
                              color="warning"
                              variant="flat"
                              onPress={onSyndicateBatchFunc}
                              className="capitalize mt-4"
                            >
                              Batch Transfer
                            </Button>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
            {/* Sell Edition */}
            <Modal
              backdrop="blur"
              // isOpen={isOpen && editionSelected == "sell"}
              isOpen={isOpen && modalFlag == BatchTypes.Airdrop}
              onClose={onClose}
              motionProps={{
                variants: {
                  enter: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.3,
                      ease: "easeOut",
                    },
                  },
                  exit: {
                    y: -20,
                    opacity: 0,
                    transition: {
                      duration: 0.2,
                      ease: "easeIn",
                    },
                  },
                },
              }}
              classNames={{
                body: "py-6",
                backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
                header: "border-b-[1px] border-[#292f46]",
                footer: "border-t-[1px] border-[#292f46]",
                closeButton: "hover:bg-white/5 active:bg-white/10",
              }}
            >
              <ModalContent>
                {() => (
                  <>
                    <ModalHeader className="flex flex-col gap-1 text-center">
                      List airdrop vault edition
                    </ModalHeader>
                    <ModalBody>
                      <div className="flex flex-col p-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <p>Ticker</p>
                          {batchOption ? (
                            <Select
                              options={batchOption}
                              onChange={(values) =>
                                setBatchIndex(values[0].value)
                              }
                              className="w-full"
                              values={[batchOption[0]]}
                            />
                          ) : (
                            <></>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <p>Price for sell</p>
                          <input
                            className="bg-[#131416] border-2 border-[#28292C] p-2 rounded-lg text-white"
                            ref={sellPriceRef}
                            placeholder="20"
                            onChange={() => onChangeHandler()}
                          />
                        </div>
                        <div className="flex flex-col mx-auto gap-1">
                          <p className="text-white text-center">Upload Image</p>
                          <input
                            type="file"
                            style={{ display: "none" }}
                            id="upload-button"
                            ref={fileInputOfListRef}
                            accept="image/*"
                            onChange={uploadFileOfList}
                          />
                          <label htmlFor="upload-button">
                            {avatar.preview ? (
                              <img
                                src={avatar.preview}
                                alt="dummy"
                                width="160px"
                                height="160px"
                                className=""
                              />
                            ) : (
                              <div className="flex flex-col gap-1 rounded-xl bg-[#28292C] w-40 h-40 justify-center items-center hover:brightness-150 duration-300 cursor-pointer">
                                <AiOutlineUpload color="white" size={26} />
                                <p className="text-white">Upload</p>
                              </div>
                            )}
                          </label>
                        </div>
                        <Button
                          color="warning"
                          variant="flat"
                          onPress={onListFunc}
                          className="capitalize mt-10"
                        >
                          List
                        </Button>
                      </div>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>

            {/* Sell Edition */}
            <Modal
              backdrop="blur"
              // isOpen={isOpen && editionSelected == "sell"}
              isOpen={isOpen && modalFlag == BatchTypes.Syndicate}
              onClose={onClose}
              motionProps={{
                variants: {
                  enter: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.3,
                      ease: "easeOut",
                    },
                  },
                  exit: {
                    y: -20,
                    opacity: 0,
                    transition: {
                      duration: 0.2,
                      ease: "easeIn",
                    },
                  },
                },
              }}
              classNames={{
                body: "py-6",
                backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
                header: "border-b-[1px] border-[#292f46]",
                footer: "border-t-[1px] border-[#292f46]",
                closeButton: "hover:bg-white/5 active:bg-white/10",
              }}
            >
              <ModalContent>
                {() => (
                  <>
                    <ModalHeader className="flex flex-col gap-1 text-center">
                      List syndicate vault edition
                    </ModalHeader>
                    <ModalBody>
                      <div className="flex flex-col p-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <p>Ticker</p>
                          {batchOption ? (
                            <Select
                              options={batchOption}
                              onChange={(values) =>
                                setBatchIndex(values[0].value)
                              }
                              className="w-full"
                              values={[batchOption[0]]}
                            />
                          ) : (
                            <></>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <p>Price for sell</p>
                          <input
                            className="bg-[#131416] border-2 border-[#28292C] p-2 rounded-lg text-white"
                            ref={sellPriceRef}
                            placeholder="20"
                            onChange={() => onChangeHandler()}
                          />
                        </div>
                        <div className="flex flex-col mx-auto gap-1">
                          <p className="text-white text-center">Upload Image</p>
                          <input
                            type="file"
                            style={{ display: "none" }}
                            id="upload-button"
                            ref={fileInputOfListRef}
                            accept="image/*"
                            onChange={uploadFileOfList}
                          />
                          <label htmlFor="upload-button">
                            {avatar.preview ? (
                              <img
                                src={avatar.preview}
                                alt="dummy"
                                width="160px"
                                height="160px"
                                className=""
                              />
                            ) : (
                              <div className="flex flex-col gap-1 rounded-xl bg-[#28292C] w-40 h-40 justify-center items-center hover:brightness-150 duration-300 cursor-pointer">
                                <AiOutlineUpload color="white" size={26} />
                                <p className="text-white">Upload</p>
                              </div>
                            )}
                          </label>
                        </div>
                        <Button
                          color="warning"
                          variant="flat"
                          onPress={onSyndicateListFunc}
                          className="capitalize mt-10"
                        >
                          List
                        </Button>
                      </div>
                    </ModalBody>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        )}
      </div>
    </>
  );
}
