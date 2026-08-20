// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MossDesk Invoice Desk
/// @notice AI-issued trade receivables (RWA) settled in native OKB on X Layer.
/// Gemini agents decide price and terms off-chain. This contract is the public
/// settlement layer: one job → one receivable → one OKB payment, with the
/// agent decision tape hashed on-chain so judges can audit the binding.
contract MossDeskInvoice {
    string public constant ASSET_CLASS = "AI_ISSUED_TRADE_RECEIVABLE";
    string public constant VERSION = "1";

    struct Invoice {
        bytes32 jobId;
        address issuer;
        address payer;
        uint96 amountWei;
        uint64 issuedAt;
        uint64 paidAt;
        string memo;
        bytes32 tapeHash;
    }

    uint256 public totalIssued;
    mapping(uint256 => Invoice) public invoices;
    mapping(bytes32 => uint256) public invoiceIdByJob;

    event InvoiceIssued(
        uint256 indexed id,
        bytes32 indexed jobId,
        address indexed issuer,
        uint96 amountWei,
        bytes32 tapeHash,
        string memo
    );

    event InvoiceSettled(
        uint256 indexed id,
        bytes32 indexed jobId,
        address indexed payer,
        uint96 amountWei
    );

    error AlreadyIssued();
    error InvalidAmount();
    error UnknownInvoice();
    error AlreadyPaid();
    error WrongPayment();

    function issue(
        bytes32 jobId,
        uint96 amountWei,
        string calldata memo,
        bytes32 tapeHash
    ) public returns (uint256 id) {
        if (amountWei == 0) revert InvalidAmount();
        if (invoiceIdByJob[jobId] != 0) revert AlreadyIssued();

        id = ++totalIssued;
        invoices[id] = Invoice({
            jobId: jobId,
            issuer: msg.sender,
            payer: address(0),
            amountWei: amountWei,
            issuedAt: uint64(block.timestamp),
            paidAt: 0,
            memo: memo,
            tapeHash: tapeHash
        });
        invoiceIdByJob[jobId] = id;

        emit InvoiceIssued(id, jobId, msg.sender, amountWei, tapeHash, memo);
    }

    function pay(uint256 id) public payable {
        Invoice storage inv = invoices[id];
        if (inv.issuedAt == 0) revert UnknownInvoice();
        if (inv.paidAt != 0) revert AlreadyPaid();
        if (msg.value != uint256(inv.amountWei)) revert WrongPayment();

        inv.payer = msg.sender;
        inv.paidAt = uint64(block.timestamp);

        emit InvoiceSettled(id, inv.jobId, msg.sender, inv.amountWei);
    }

    /// @notice One-shot path for the demo wallet: mint the receivable and settle it.
    function issueAndPay(
        bytes32 jobId,
        uint96 amountWei,
        string calldata memo,
        bytes32 tapeHash
    ) external payable returns (uint256 id) {
        id = issue(jobId, amountWei, memo, tapeHash);
        pay(id);
    }

    function getInvoice(uint256 id) external view returns (Invoice memory) {
        return invoices[id];
    }
}
