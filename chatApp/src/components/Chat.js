import Web3 from 'web3';
import React, { Component } from 'react';
import ChatApp from '../abis/ChatApp.json'
import mainLogo from './arrow.png'

class Chat extends Component {

    async componentWillMount() {
        await this.loadWeb3()
        await this.loadBlockchainData()
        await this.listenToMessages()
        await this.listenToEther()
        await this.listenToAskEther()
        await this.listenToFetchAllMsg()
        await this.fetchAllMsg()
        await this.updateUIData()
      }

    constructor(props) {
        super(props)
        let chats = [
            {
                msg: "This is a blockchain demo, try to tap in!",
                response: true
            },
            {
                msg: "Enter \"send_ether: 0.0001\" to send some tokens to your recipient 😃",
                response: false
            }
        ]
        this.state = {
            fixedChats: chats,
            chats: [],
            inputValue: '',
            accounts: [],
            account: '',
            nbBlocks: 0,
            otherAccount: '',
            accountNbTransactions: 0,
            otherAccountNbTransactions: 0,
            accountBalance: 0,
            otherAccountBalance: 0,
            lastGas: 0,
            blockHash: '',
            didATransaction: false,
            isLastTransactionSuccess: false,
            didARequest: false,
            accountRequesting: '',
            accountRequested: '',
            valueRequested: 0,
        }
    }

    // ------- init ------
    async loadWeb3() {
        if (window.ethereum) {
            // Check if WebSocket is available and create Web3 instance
            try {
                // Use WebSocket provider for real-time events
                window.web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"));
                await window.ethereum.request({ method: 'eth_requestAccounts' });
            } catch (error) {
                console.error("Error connecting to Web3 WebSocket provider:", error);
                window.alert("Failed to connect to Web3 WebSocket provider. Please check your WebSocket connection.");
            }
        } else if (window.web3) {
            // Legacy Web3 provider support
            window.web3 = new Web3(window.ethereum);
        } else {
            // No Ethereum provider detected
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
    }
    

    async loadBlockchainData()  {
        const web3 = window.web3
    
        const accounts = await web3.eth.getAccounts()
        console.log(accounts)
        this.setState({ 
            accounts: accounts,
            account: accounts[0],
            otherAccount: accounts[1]
         })
        console.log(accounts)
    
        const ethBalance = await web3.eth.getBalance(this.state.account)
        this.setState({ ethBalance })
    
        // Load smart contract
        const networkId =  await web3.eth.net.getId()
        const chatAppData = ChatApp.networks[networkId]
        const abi = ChatApp.abi
        if(chatAppData) {
          const chatContract = new web3.eth.Contract(abi, chatAppData.address)
          this.setState({ chatContract: chatContract })
        }
        else {
            window.alert('Chat contract not deployed to detected network.')
        }
    }

    // ------- listeners ------
    async listenToMessages() {
        var binded = this.didReceiveMessageBinded.bind(this)
        this.state.chatContract.events.messageSentEvent({})
        .on('data', binded)
        .on('error', console.error);
    }

    async listenToEther() {
        var binded = this.didReceiveEtherBinded.bind(this)
        this.state.chatContract.events.etherSentEvent({})
        .on('data', binded)
        .on('error', console.error);
    }

    async listenToAskEther() {
        var binded = this.didReceiveAskEtherBinded.bind(this)
        this.state.chatContract.events.etherAskEvent({})
        .on('data', binded)
        .on('error', console.error);
    }

    async listenToFetchAllMsg() {
        var binded = this.didReceiveAllMsgBinded.bind(this)
        this.state.chatContract.events.messagesFetchedEvent({})
        .on('data', binded)
        .on('error', console.error);
    }

    // ------- handlers ------
    async didReceiveMessageBinded(event){
        const message = event.returnValues.message
        if (event.returnValues.from === this.state.account){
            this.didReceiveMessage(message, true)
        }
        if (event.returnValues.to === this.state.account){
            this.didReceiveMessage(message, false)
        }
        this.setState({
            didATransaction: false,
            didARequest: false,
        })
        await this.updateUIData()
    }

    async didReceiveEtherBinded(event) {
        this.setState({
            didATransaction: true,
            didARequest: false,
            isLastTransactionSuccess: event.returnValues.success
        })
        // await this.wait()
        await this.updateUIData()
    }

    async didReceiveAskEtherBinded(event){
        if (this.state.account === event.returnValues.to) {
            let value_as_wei = window.web3.utils.fromWei(
                event.returnValues.value, "ether")
    
            this.setState({
                didATransaction: false,
                didARequest: true,
                accountRequesting: event.returnValues.from,
                accountRequested: event.returnValues.to,
                valueRequested: value_as_wei,
            })
            await this.updateUIData()
        }
    }

    async didReceiveAllMsgBinded(event){
        let allMsg = []

        event.returnValues.messages.forEach((message) => {
            allMsg.push({
                msg: message['message'],
                response: message['from'] === this.state.account
            })
        })
        if (allMsg.length === 0)
            allMsg = this.state.fixedChats

        this.setState({
            chats: allMsg
        })
        await this.updateUIData()
    }

    async didReceiveMessage(message, isResponse) {
        let chats = this.state.chats
        chats.push(
            {
                msg: message,
                response: isResponse
            }
        )
        this.setState({
            chats: chats,
            inputValue: ''
        })
    }

  async didSendMessage(message) {
    console.log("Sending message:", message);
     this.setState(prevState => ({
      chats: [...prevState.chats, { msg: message, response: true }]
    }));
    try {
        await this.state.chatContract.methods.sendMsg(this.state.otherAccount, message)
            .send({ from: this.state.account, gas: 1500000 });
        console.log("Message sent successfully!");
        await this.sendEtherIfAsked();
        await this.askEtherIfAsked();
    } catch (error) {
        console.error("Error sending message:", error);
    }
}


    async sendEtherIfAsked() {
        let splitted = this.state.inputValue.split(':')
        if (splitted.length !== 2)
            return false

        if (splitted[0] === "send_ether" && this.isNumeric(splitted[1])) {
            let asWei = parseFloat(splitted[1]) * 1e18
            this.state.chatContract.methods.sendEther(this.state.otherAccount).send({
                from: this.state.account,
                value: asWei
            })
            return true
        }
        return false
    }

    async askEtherIfAsked() {
        let splitted = this.state.inputValue.split(':')
        if (splitted.length !== 2)
            return false

        if (splitted[0] === "ask_ether" && this.isNumeric(splitted[1])) {
            var asWei = (parseFloat(splitted[1]) * 1e18).toString()
            this.state.chatContract.methods.askEther(this.state.otherAccount, asWei).send({ from: this.state.account })
            return true
        }
        return false
    }

    async fetchAllMsg() {
        await this.state.chatContract.methods.getAllMsg(this.state.otherAccount).send({ from: this.state.account })
      
    }

    // ------- UI state updaters ------
    async updateUIData() {
        await this.updateNbTransactions()
        await this.updateBalances()
        await this.updateBlocks()
        await this.updateLastGas()
    }

    updateInputValue(evt) {
        this.setState({
          inputValue: evt.target.value
        });
      }

    async updateAddressSelect(newValue, isOtherAccount) {
        if (isOtherAccount) {
            this.setState({
                otherAccount: newValue,
                chats: this.state.fixedChats
            })
        }
        else {
            this.setState({
                account: newValue,
                chats: this.state.fixedChats
            })
        }
        await this.wait()
        await this.fetchAllMsg()
        await this.updateUIData()
    }

    async updateNbTransactions() {
        let accountNbTransactions = await window.web3.eth.getTransactionCount(this.state.account)
        let otherAccountNbTransactions = await window.web3.eth.getTransactionCount(this.state.otherAccount)
        this.setState({
            accountNbTransactions: accountNbTransactions,
            otherAccountNbTransactions: otherAccountNbTransactions
        })
    }

    async updateBalances() {
        let accountBalance = await window.web3.eth.getBalance(this.state.account)
        let otherAccountBalance = await window.web3.eth.getBalance(this.state.otherAccount)
        this.setState({
            accountBalance: window.web3.utils.fromWei(accountBalance, 'ether'),
            otherAccountBalance: window.web3.utils.fromWei(otherAccountBalance, 'ether')
        })
    }

    async updateBlocks() {
        const latest = await window.web3.eth.getBlockNumber()
        this.setState({
            nbBlocks: latest
        })
    }

    async updateLastGas() {
        const lastBlockNumber = await window.web3.eth.getBlockNumber();
        let block = await window.web3.eth.getBlock(lastBlockNumber);
        block = await window.web3.eth.getBlock(lastBlockNumber);

        const lastTransaction = block.transactions[block.transactions.length - 1];
        const transaction = await window.web3.eth.getTransaction(lastTransaction);

        this.setState({
            blockHash: transaction["blockHash"],
            lastGas: transaction["gas"],
        })
    }

    // ------- UI ------
    getMessagesAsDivs() {
        let chatDivs = this.state.chats.map((x, index) => 
           
            x.response ? 
                <div className="message text-only" key={`response-${index}`}>
                    <div className="response">
                        <p className="text">{x.msg}</p>
                        
                    </div>
                </div> :
                
                <div className="message text-only" key={`message-${index}`}>
                    <p className="text">{x.msg}</p>
                </div>
        );
        return chatDivs.reverse();
    }
    

    getToggleAdresses(isOtherAccount) {
        var addresses = []
        for (var i = 0; i < this.state.accounts.length; i++) {
            let account = this.state.accounts[i]
            if ((isOtherAccount && account === this.state.otherAccount)
                || (!isOtherAccount && account === this.state.account))
                addresses.push(<option value={account} select="true" key={account}>{account}</option>)
            else {
                addresses.push(<option value={account} key={account}>{account}</option>)
            }
        }
        return addresses
    }

    displayEtherTransactionStatus() {
        if (!this.state.didATransaction)
            return

        if (this.state.isLastTransactionSuccess)
            return <div style={{color: "green"}}>ETH transaction succeeded!</div>
        else
            return <div>error</div>
    }

    displayAskEtherPopUp() {
        let to = this.state.accountRequested
        let valueAsEther = this.state.valueRequested
        let valueAsWei = parseFloat(this.state.valueRequested) * 1e18
        
        if (this.state.didARequest && to === this.state.account) {
            return (
            <div className="didAskContainer">
                <h6>Ether request</h6>
                <p>Account { to } requests you { valueAsEther } ether.</p>
                
                <button className="btn btn-success send-btn" onClick={() => this.state.chatContract.methods.sendEther(this.state.accountRequesting).send({
                    from: to,
                    value: valueAsWei
                })}>Accept</button>
            </div>
            )
        }
        return
    }

    // ------- helpers ------
    isNumeric(str) {
        if (typeof str != "string") return false
        return !isNaN(str) &&
               !isNaN(parseFloat(str))
      }

    async wait() {
        const noop = ()=>{};
        for (var i = 0; i < 10000; i++)
            noop()
    }

    // ------- rendering ------
    render() {
        return (
        
            <div className="block-container">
                <div className="row">
                    <div className="col-7 left-block">
                        <section className="chat">
                            <div className="header-chat">
                                <div className="left">
                                    <img src={mainLogo} className="arrow" alt='arrow'/>
                                    <select className="custom-select" onChange={e => this.updateAddressSelect(e.target.value, false)} >
                                        { this.getToggleAdresses(false) }
                                    </select>     
                                </div>
                                <div className="right">
                                    <select className="custom-select" onChange={e => this.updateAddressSelect(e.target.value, true)} >
                                        { this.getToggleAdresses(true) }
                                    </select>  
                                </div>
                            </div>
                            <div className="messages-chat">
                            { this.getMessagesAsDivs() }
                            </div>
                        </section>
                        <div className="footer-chat">
                            <i className="icon fa fa-smile-o clickable" style={{fontSize: "25pt"}} aria-hidden="true"></i>
                            <input value={this.state.inputValue} onChange={evt => this.updateInputValue(evt)} type="text" className="write-message" placeholder="Type your message here"></input>
                            <i className="icon send fa fa-paper-plane-o clickable" aria-hidden="true"></i>
                            <button className="btn btn-success send-btn" onClick={() => this.didSendMessage(this.state.inputValue)}>Send</button>
                        </div>
                    </div>
                    <div className="col-5 right-block">
                        <h3>Blockchain state</h3>
                        <p>Number of blocks: { this.state.nbBlocks }</p>
                        <p>Last transaction gas: { this.state.lastGas }</p>
                        <div className="sender-block blockchain-block">
                            <p><b>Sender address:</b></p>
                            <p>{ this.state.account }</p>
                            <p>Number of transactions: { this.state.accountNbTransactions }</p>
                            <p>Wallet balance: { this.state.accountBalance } ETH</p>
                        </div>
                        <div className="recip-block blockchain-block">
                            <p><b>Recipient address:</b></p>
                            <p>{ this.state.otherAccount }</p>
                            <p>Number of transactions: { this.state.otherAccountNbTransactions }</p>
                            <p>Wallet balance: { this.state.otherAccountBalance } ETH</p>
                        </div>

                        <div className="alert-transac">
                            { this.displayEtherTransactionStatus() }
                        </div>
                        <div className="alert-request">
                            { this.displayAskEtherPopUp() }
                        </div>
                        
                    </div>
                </div>
                
                </div>
      )
    }

}

export default Chat;