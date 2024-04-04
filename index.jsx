/**
 * Plugins
 */
import React from 'react';
import _ from 'lodash';
import {
    Grid,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Slide,
    Button,
    Box,
    Paper,
    Icon,
    IconButton,
    InputBase,
    ButtonGroup,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import DesktopWindowsIcon from '@material-ui/icons/DesktopWindows';
import FilterDramaIcon from '@material-ui/icons/FilterDrama';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import LoopIcon from '@material-ui/icons/Loop';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import isMobile from 'ismobilejs';

/**
 * Global Utils
 */
import { getRzpKey } from '../../utils/configkey';
import { removeNewTemplateKeys, hasPermission } from '../../utils/common';
import { aclUrl } from '../../utils/formValidation';
/**
 * Template
 */

/**
 * Child UIElements
 */
import Wallet from './uiElements/wallet';
import Menu from './uiElements/menu';
import GlobalSearch from './uiElements/globalSearch';
import CurrentBalance from './uiElements/currentBalance';

/**
 * CSS
 */
import { Common } from '../../../../css/common';
import { Layout } from '../../../../css/layout';
import { SubscriptionsSearch } from '../../../../css/subscriptionsSearch';
import TouchRipple from '@material-ui/core/ButtonBase/TouchRipple';

/**
 * Global Utils
 */
import { regexReplace } from '../../utils/formValidation';
import { getPermissionCode } from '../../utils/common';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}
const options = ['Upgrade', 'Add Count', 'Convert to SoftLock'];

const DashboardChannelPartners = (props) => {
    const history = useHistory();
    const { pathname } = useLocation(pathname);
    const common = Common(props);
    const layout = Layout(props);
    const subscriptionsSearch = SubscriptionsSearch(props);
    const [tab, setTab] = React.useState(0);
    const [searchBox, setSearchBox] = React.useState(false);
    const [isNew, setIsNew] = React.useState(TouchRipple);
    const [isRenew, setIsRenew] = React.useState(false);
    const [isUpgrade, setIsUpgrade] = React.useState(false);
    const [isPerpetual, setIsPerpetual] = React.useState(false);
    const [isSubscription, setIsSubscription] = React.useState(false);
    const [searchCount, setSearchCount] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const anchorRef2 = React.useRef(null);
    const [searchSoftLock, setSearchSoftLock] = React.useState(false);

    const handleMenuItemClick = (option, index) => {
        setOpen(false);
        setIsRenew(false);
        setSearchBox(false);
        setIsSubscription(false);
        setIsPerpetual(false);
        if (option === 'Upgrade') {
            return handleUpgrade();
        } else if (option === 'Add Count') {
            return handleCount();
        } else {
            return handleSoftLock();
        }
    };
    const handleToggle = () => {
        setOpen((prevOpen2) => !prevOpen2);
        setIsRenew(false);
        setSearchBox(false);
        setIsRenew(false);
        setIsSubscription(false);
        setIsPerpetual(false);
        setSearchCount(false);
        setSearchSoftLock(false);
        setIsUpgrade(true);
    };

    const handleClose = (event) => {
        if (anchorRef2.current && anchorRef2.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    useEffect(() => {
        props.getPermissionFn(pathname);
        return () => {
            //props.resetStateFn();
        };
    }, []);
    useEffect(() => {
        if (props.transactionFormData.orderId) {
            let hideList = [
                // {
                //     method: 'card',
                // },
                {
                    method: 'wallet',
                },
                {
                    method: 'emi',
                },
                {
                    method: 'cardless_emi',
                },
                {
                    method: 'bank_transfer',
                },
                {
                    method: 'paylater',
                },
            ];
            if (props.transactionFormData.country_name !== 'India') {
                hideList = [
                    {
                        method: 'upi',
                    },
                    {
                        method: 'netbanking',
                    },
                    {
                        method: 'wallet',
                    },
                    {
                        method: 'emi',
                    },
                    {
                        method: 'cardless_emi',
                    },
                    {
                        method: 'bank_transfer',
                    },
                    {
                        method: 'paylater',
                    },
                ];
            }
            let options = {
                key_id: getRzpKey(),
                order_id: props.transactionFormData.razorPayOrderId,
                config: {
                    display: {
                        // The display config
                        hide: hideList,
                    },
                },
                handler: function (response) {
                    let obj = {
                        ac: parseFloat(props.transactionFormData.ac),
                        paymentid: response.razorpay_payment_id,
                        orderid: props.transactionFormData.razorPayOrderId,
                        id: props.transactionFormData.orderId,
                        paymentResponse: {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        },
                    };

                    props.transactionSussesFn(obj, pathname);
                },
            };
            let rzp1 = new Razorpay(options);

            rzp1.on('payment.failed', function (response) {
                let obj = {
                    status: 'failed',
                    paymentId: response.error.metadata.payment_id,
                    orderId: response.error.metadata.order_id,
                    paymentResponse: response,
                };

                props.transactionErrorFn(obj);
            });
            rzp1.open();
        }
        return () => {
            //props.resetStateFn();
        };
    }, [props.transactionFormData.orderId]);

    const url = () => {
        let link = getPermissionCode(
            {
                partnerdashboard: '/partner/online/create',
                resellerdashboard: '/reseller/online/create',
            },
            aclUrl(removeNewTemplateKeys(pathname)),
        );

        return link;
    };
    const urlSubscription = () => {
        let link = getPermissionCode(
            {
                partnerdashboard: '/partner/desktop/desktopSubscription',
                resellerdashboard: '/reseller/desktop/desktopSubscription',
            },
            aclUrl(removeNewTemplateKeys(pathname)),
        );

        return link;
    };
    const urlPerpetual = () => {
        let link = getPermissionCode(
            {
                partnerdashboard: '/partner/desktop/perpetualLicense',
                resellerdashboard: '/reseller/desktop/perpetualLicense',
            },
            aclUrl(removeNewTemplateKeys(pathname)),
        );

        return link;
    };

    const handleTab = (val) => {
        props.updateInputFn('');
        if (val === 2) {
            setSearchBox(false);
            setIsNew(false);
            setIsPerpetual(false);
            setIsSubscription(false);
            setSearchCount(false);
            setSearchSoftLock(false);
            setIsUpgrade(false);
        } else if (val === 0) {
            setIsPerpetual(false);
            setIsSubscription(false);
            setSearchBox(false);
            setIsUpgrade(false);
        } else {
            setSearchBox(false);
            setIsNew(false);
            setIsPerpetual(false);
            setIsSubscription(false);
            setSearchCount(false);
            setSearchSoftLock(false);
            setIsUpgrade(false);
        }
        setTab(val);
        setIsRenew(false);
    };

    const handleNew = () => {
        setIsNew(true);
        setIsRenew(false);
        setIsUpgrade(false);
        if (tab === 1) {
            setSearchBox(false);
            history.push(url());
        }
        setIsPerpetual(false);
        setSearchBox(true);
        setIsSubscription(false);
    };
    const handleRenew = () => {
        setSearchBox(false);
        setTimeout(() => {
            setSearchBox(true);
        }, 1);
        setSearchCount(false);
        setSearchSoftLock(false);
        setIsNew(false);
        setIsRenew(true);
        setIsUpgrade(false);
        setIsPerpetual(false);
        setIsSubscription(false);
    };
    const handleUpgrade = () => {
        setSearchBox(false);
        setTimeout(() => {
            setSearchBox(true);
        }, 1);
        setSearchCount(false);
        setSearchSoftLock(false);
        setIsNew(false);
        setIsRenew(false);
        setIsUpgrade(true);
        setIsPerpetual(false);
        setIsSubscription(false);
    };

    const handleSubscriptionClick = () => {
        let click = hasPermission(
            props.permissionCodeData,
            props.permissionCode.desktopdesktopubscription,
            aclUrl(removeNewTemplateKeys(pathname)),
        );
        if (click) {
            history.push(urlSubscription());
        }
    };
    const handlePerpetualClick = () => {
        let click = hasPermission(
            props.permissionCodeData,
            props.permissionCode.desktopperpetualicense,
            aclUrl(removeNewTemplateKeys(pathname)),
        );
        if (click) {
            history.push(urlPerpetual());
        }
    };
    const handleCount = () => {
        setIsSubscription(false);
        setIsUpgrade(false);
        setSearchCount(true);
        setIsPerpetual(false);
        setSearchSoftLock(false);
    };

    const handleSoftLock = () => {
        setIsSubscription(false);
        setIsUpgrade(false);
        setSearchCount(false);
        setIsPerpetual(false);
        setSearchSoftLock(true);
    };

    const placeholderText = () => {
        let val = 'Subscription ID';

        if (tab === 2) {
            val = 'Serial No. / Subscription ID';
        }

        return val;
    };

    const updateSearch = (e) => {
        e.stopPropagation();

        let val = e.target.value;

        if (tab === 1) {
            val = regexReplace('alphaNumWithoutSpace', val);
            val = val.slice(0, 10);
        } else if (tab === 2) {
            val = regexReplace('alphaNumWithoutSpace', val);
            val = val.slice(0, 10);
            //val = val.toUpperCase();
        } else if (tab === 0) {
            val = regexReplace('alphaNumWithoutSpace', val);
            val = val.slice(0, 10);
        }

        props.updateInputFn(val);
    };

    const searchFn = (e, history, a, b, path) => {
        e.preventDefault();
        if (props.searchData) {
            let eventType = 'new';
            if (isRenew) {
                eventType = 'renew';
            } else if (isUpgrade) {
                eventType = 'modify';
            }
            props.searchFn(tab, eventType, history, pathname, path);
        }
    };

    const closeSearchPopup = () => {
        let searchApproval = JSON.parse(JSON.stringify(props.searchApproval));

        searchApproval.popup = false;
        searchApproval.message = '';
        searchApproval.page = '';
        searchApproval.data = [];

        props.resetSearchPopupFn(searchApproval);
    };

    const closeSoftlockPopup = () => {
        let softlockPopup = JSON.parse(JSON.stringify(props.softlockPopup));

        softlockPopup.popup = false;
        softlockPopup.message = '';
        props.resetSoftlockPopupFn(softlockPopup);

        let link = getPermissionCode(
            {
                partnerdashboard: '/partner/dashboard',
                resellerdashboard: '/reseller/dashboard',
            },
            aclUrl(removeNewTemplateKeys(pathname)),
        );
        return link;
    };
    const closehardlockUpgradeFn = () => {
        props.showhardlockfn();

        let link = getPermissionCode(
            {
                partnerdashboard: '/partner/dashboard',
                resellerdashboard: '/reseller/dashboard',
            },
            aclUrl(removeNewTemplateKeys(pathname)),
        );
        return link;
    };
    const closeSearchPopupFn = () => {
        props.showSearchPopupfn();

        let link = getPermissionCode(
            {
                partnerdashboard: '/partner/dashboard',
                resellerdashboard: '/reseller/dashboard',
            },
            aclUrl(removeNewTemplateKeys(pathname)),
        );
        return link;
    };
    const closeSearchUpgradePopupFn = () => {
        props.searchUpgradePopupfn();

        let link = getPermissionCode(
            {
                partnerdashboard: '/partner/dashboard',
                resellerdashboard: '/reseller/dashboard',
            },
            aclUrl(removeNewTemplateKeys(pathname)),
        );
        return link;
    };

    const closesearchSubPerPePopupFn = () => {
        props.searchSubPerPePopupfn();

        let link = getPermissionCode(
            {
                partnerdashboard: '/partner/dashboard',
                resellerdashboard: '/reseller/dashboard',
            },
            aclUrl(removeNewTemplateKeys(pathname)),
        );
        return link;
    };

    const searchActionButton = (actionTypoe) => {
        let isDisabled = false;
        if (tab === 1) {
            if (actionTypoe === 'new') {
                isDisabled = !hasPermission(
                    props.permissionCodeData,
                    props.permissionCode.onlineNew,
                    aclUrl(removeNewTemplateKeys(pathname)),
                );
            } else if (actionTypoe === 'renew') {
                isDisabled = !hasPermission(
                    props.permissionCodeData,
                    props.permissionCode.onlineRenew,
                    aclUrl(removeNewTemplateKeys(pathname)),
                );
            } else if (actionTypoe === 'upgrade') {
                isDisabled = !hasPermission(
                    props.permissionCodeData,
                    props.permissionCode.onlineUpgrade,
                    aclUrl(removeNewTemplateKeys(pathname)),
                );
            }
        } else if (tab === 2) {
            if (actionTypoe === 'new') {
                isDisabled = !hasPermission(
                    props.permissionCodeData,
                    props.permissionCode.mobileNew,
                    aclUrl(removeNewTemplateKeys(pathname)),
                );
            } else if (actionTypoe === 'renew') {
                isDisabled = !hasPermission(
                    props.permissionCodeData,
                    props.permissionCode.mobileRenew,
                    aclUrl(removeNewTemplateKeys(pathname)),
                );
            }
        } else if (tab === 0) {
            if (actionTypoe === 'renew') {
                if (
                    !hasPermission(
                        props.permissionCodeData,
                        props.permissionCode.desktopPerpetualRenew,
                        aclUrl(removeNewTemplateKeys(pathname)),
                    ) &&
                    !hasPermission(
                        props.permissionCodeData,
                        props.permissionCode.desktopSubscriptionRenew,
                        aclUrl(removeNewTemplateKeys(pathname)),
                    )
                ) {
                    isDisabled = true;
                }
            } else if (actionTypoe === 'desktopdesktopubscription') {
                isDisabled = !hasPermission(
                    props.permissionCodeData,
                    props.permissionCode.desktopdesktopubscription,
                    aclUrl(removeNewTemplateKeys(pathname)),
                );
            } else if (actionTypoe === 'desktopperpetualicense') {
                isDisabled = !hasPermission(
                    props.permissionCodeData,
                    props.permissionCode.desktopperpetualicense,
                    aclUrl(removeNewTemplateKeys(pathname)),
                );
            }
        }

        return isDisabled;
    };

    const renderWallet = () => {
        return (
            <Wallet
                getWalletDataFn={props.getWalletDataFn}
                walletData={props.walletData}
                resetWalletDataFn={props.resetWalletDataFn}
                isTransactionScreen={props.isTransactionScreen}
                transactionScreen={props.transactionScreen}
                transactionFormData={props.transactionFormData}
                transactionFormDataFn={props.transactionFormDataFn}
                transactionFormPopup={props.transactionFormPopup}
                resetTransactionFormDataFn={props.resetTransactionFormDataFn}
                updateAPIFn={props.updateAPIFn}
                transactionSubmitFn={props.transactionSubmitFn}
                pathname={pathname}
                permissionCodeData={props.permissionCodeData}
                permissionCode={props.permissionCode}
                pageName={aclUrl(removeNewTemplateKeys(pathname))}
                formScreen={props.formScreen}
                isFormScreen={props.isFormScreen}
                walletFormDataFn={props.walletFormDataFn}
                walletFormData={props.walletFormData}
                approvalPopup={props.approvalPopup}
                approval={props.approval}
                drawerToggleFn={props.drawerToggleFn}
                drawerToggle={props.drawerToggle}
                getDrawerData={props.getDrawerData}
                updateSearchFn={props.updateSearchFn}
                search={props.search}
                pList={props.pList}
                selectedItem={props.selectedItem}
                setSelectedItem={props.setSelectedItem}
                nextRequest={props.nextRequest}
                resultsCount={props.resultsCount}
                results={props.results}
                drawerData={props.drawerData}
                resetWalletFormDataFn={props.resetWalletFormDataFn}
            />
        );
    };
    const renderMenu = () => {
        return <Menu data={props.menu} />;
    };

    const rendeProduct = () => {
        return (
            <Box>
                <Grid container className={layout.tabs}>
                    <Grid
                        item
                        xs={6}
                        sm={2}
                        className={`tab0 ${
                            tab === 0 ? layout.tabItemsSelected : ''
                        } ${layout.tabItems}`}
                        onClick={() => handleTab(0)}
                    >
                        <DesktopWindowsIcon fontSize="inherit" />
                        {!isMobile.phone && 'Desktop'}
                    </Grid>
                    <Grid
                        item
                        xs={6}
                        sm={2}
                        className={`tab1 ${
                            tab === 1 ? layout.tabItemsSelected : ''
                        } ${layout.tabItems}`}
                        onClick={() => handleTab(1)}
                    >
                        <FilterDramaIcon fontSize="inherit" />
                        {!isMobile.phone && 'Online'}
                    </Grid>
                    <Grid
                        item
                        xs={6}
                        sm={2}
                        className={`tab2 ${
                            tab === 2 ? layout.tabItemsSelected : ''
                        } ${layout.tabItems}`}
                        onClick={() => handleTab(2)}
                    >
                        <PhoneAndroidIcon fontSize="inherit" />
                        {!isMobile.phone && 'Mobile'}
                    </Grid>
                    {!isMobile.phone ? (
                        <Grid
                            item
                            xs={6}
                            //sm={2}
                        >
                            <CurrentBalance
                                getWalletDataFn={props.getWalletDataFn}
                                walletData={props.walletData}
                                resetWalletDataFn={props.resetWalletDataFn}
                                isTransactionScreen={props.isTransactionScreen}
                                transactionScreen={props.transactionScreen}
                                transactionFormData={props.transactionFormData}
                                transactionFormDataFn={
                                    props.transactionFormDataFn
                                }
                                transactionFormPopup={
                                    props.transactionFormPopup
                                }
                                resetTransactionFormDataFn={
                                    props.resetTransactionFormDataFn
                                }
                                updateAPIFn={props.updateAPIFn}
                                transactionSubmitFn={props.transactionSubmitFn}
                                pathname={pathname}
                                permissionCodeData={props.permissionCodeData}
                                permissionCode={props.permissionCode}
                                pageName={aclUrl(
                                    removeNewTemplateKeys(pathname),
                                )}
                                formScreen={props.formScreen}
                                isFormScreen={props.isFormScreen}
                                walletFormDataFn={props.walletFormDataFn}
                                walletFormData={props.walletFormData}
                                approvalPopup={props.approvalPopup}
                                approval={props.approval}
                                drawerToggleFn={props.drawerToggleFn}
                                drawerToggle={props.drawerToggle}
                                getDrawerData={props.getDrawerData}
                                updateSearchFn={props.updateSearchFn}
                                search={props.search}
                                pList={props.pList}
                                selectedItem={props.selectedItem}
                                setSelectedItem={props.setSelectedItem}
                                nextRequest={props.nextRequest}
                                resultsCount={props.resultsCount}
                                results={props.results}
                                drawerData={props.drawerData}
                                resetWalletFormDataFn={
                                    props.resetWalletFormDataFn
                                }
                            />
                        </Grid>
                    ) : null}
                </Grid>
                {isMobile.phone ? (
                    <Grid
                        item
                        xs={12}
                        //sm={2}
                    >
                        <CurrentBalance
                            getWalletDataFn={props.getWalletDataFn}
                            walletData={props.walletData}
                            resetWalletDataFn={props.resetWalletDataFn}
                            isTransactionScreen={props.isTransactionScreen}
                            transactionScreen={props.transactionScreen}
                            transactionFormData={props.transactionFormData}
                            transactionFormDataFn={props.transactionFormDataFn}
                            transactionFormPopup={props.transactionFormPopup}
                            resetTransactionFormDataFn={
                                props.resetTransactionFormDataFn
                            }
                            updateAPIFn={props.updateAPIFn}
                            transactionSubmitFn={props.transactionSubmitFn}
                            pathname={pathname}
                            permissionCodeData={props.permissionCodeData}
                            permissionCode={props.permissionCode}
                            pageName={aclUrl(removeNewTemplateKeys(pathname))}
                            formScreen={props.formScreen}
                            isFormScreen={props.isFormScreen}
                            walletFormDataFn={props.walletFormDataFn}
                            walletFormData={props.walletFormData}
                            approvalPopup={props.approvalPopup}
                            approval={props.approval}
                            drawerToggleFn={props.drawerToggleFn}
                            drawerToggle={props.drawerToggle}
                            getDrawerData={props.getDrawerData}
                            updateSearchFn={props.updateSearchFn}
                            search={props.search}
                            pList={props.pList}
                            selectedItem={props.selectedItem}
                            setSelectedItem={props.setSelectedItem}
                            nextRequest={props.nextRequest}
                            resultsCount={props.resultsCount}
                            results={props.results}
                            drawerData={props.drawerData}
                            resetWalletFormDataFn={props.resetWalletFormDataFn}
                        />
                    </Grid>
                ) : null}
                <Grid item xs={12} className={layout.tabDetails}>
                    {tab === 0 ? (
                        <Grid container>
                            <Grid component="span">
                                <Button
                                    variant="contained"
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={() => handlePerpetualClick()}
                                    disabled={searchActionButton(
                                        'desktopperpetualicense',
                                    )}
                                >
                                    Perpetual
                                </Button>
                            </Grid>
                            <Grid component="span">
                                <Button
                                    variant="contained"
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={() => handleSubscriptionClick()}
                                    //className={isSubscription ? 'selected' : ''}
                                    disabled={searchActionButton(
                                        'desktopdesktopubscription',
                                    )}
                                >
                                    Subscription
                                </Button>
                            </Grid>
                            <Grid component="span">
                                <Button
                                    variant="contained"
                                    startIcon={<LoopIcon />}
                                    onClick={() => handleRenew()}
                                    className={isRenew ? 'selected' : ''}
                                    disabled={searchActionButton('renew')}
                                >
                                    Renew
                                </Button>
                            </Grid>
                            <Grid component="span">
                                <Button
                                    variant="contained"
                                    startIcon={<LoopIcon />}
                                    onClick={() => handleRenew()}
                                    className={isRenew ? 'selected' : ''}
                                    disabled={searchActionButton('renew')}
                                >
                                    Update
                                </Button>
                            </Grid>
                            <Grid
                                component="span"
                                style={{
                                    marginRight: 30,
                                    marginBottom: 24,
                                    marginTop: 7,
                                }}
                            >
                                <ButtonGroup aria-label="split button">
                                    <Button
                                        onClick={() => handleUpgrade()}
                                        style={{
                                            width: 180,
                                        }}
                                        startIcon={<OpenInNewIcon />}
                                        className={isUpgrade ? 'selected' : ''}
                                        disabled={searchActionButton('upgrade')}
                                    >
                                        Upgrade
                                    </Button>
                                    <Button
                                        style={{
                                            borderLeft: '1px solid #000',
                                        }}
                                        className={isUpgrade ? 'selected' : ''}
                                        color="primary"
                                        size="small"
                                        aria-controls={
                                            open
                                                ? 'split-button-menu'
                                                : undefined
                                        }
                                        aria-expanded={
                                            open ? 'true' : undefined
                                        }
                                        aria-label="select merge strategy"
                                        aria-haspopup="menu"
                                        onClick={handleToggle}
                                        // disabled={
                                        //     !hasPermission(
                                        //         props.permissionCodeData,
                                        //         props.permissionCode
                                        //             .subscriptionAddCount,
                                        //         aclUrl(
                                        //             removeNewTemplateKeys(
                                        //                 pathname,
                                        //             ),
                                        //         ),
                                        //     ) &&
                                        //     !hasPermission(
                                        //         props.permissionCodeData,
                                        //         props.permissionCode
                                        //             .desktopdesktopubscription,
                                        //         aclUrl(
                                        //             removeNewTemplateKeys(
                                        //                 pathname,
                                        //             ),
                                        //         ),
                                        //     )
                                        // }
                                    >
                                        <ArrowDropDownIcon />
                                    </Button>
                                </ButtonGroup>
                                <Popper
                                    open={open}
                                    anchorEl={anchorRef2.current}
                                    role={undefined}
                                    transition
                                    disablePortal
                                    style={{
                                        width: '100%',
                                        position: 'inherit',
                                        marginTop: 1,
                                    }}
                                >
                                    {({ TransitionProps, placement }) => (
                                        <Grow
                                            {...TransitionProps}
                                            style={{
                                                paddingTop: 0,
                                                paddingBottom: 0,
                                                transformOrigin:
                                                    placement === 'bottom'
                                                        ? 'center top'
                                                        : 'center bottom',
                                            }}
                                        >
                                            <Paper>
                                                <ClickAwayListener
                                                    onClickAway={handleClose}
                                                >
                                                    <MenuList id="split-button-menu">
                                                        {options.map(
                                                            (option, index) => (
                                                                <MenuItem
                                                                    key={option}
                                                                    // disabled={
                                                                    //     option ===
                                                                    //         'Convert to SoftLock' ||
                                                                    //         option ===
                                                                    //         'Add Count'
                                                                    //         ? true
                                                                    //         : false
                                                                    // }
                                                                    onClick={(
                                                                        event,
                                                                    ) =>
                                                                        handleMenuItemClick(
                                                                            option,
                                                                            index,
                                                                        )
                                                                    }
                                                                >
                                                                    {option}
                                                                </MenuItem>
                                                            ),
                                                        )}
                                                    </MenuList>
                                                </ClickAwayListener>
                                            </Paper>
                                        </Grow>
                                    )}
                                </Popper>
                            </Grid>
                        </Grid>
                    ) : null}

                    {tab !== 0 ? (
                        <Button
                            variant="contained"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => handleNew()}
                            className={isNew ? 'selected' : ''}
                            disabled={searchActionButton('new')}
                            elevation={10}
                        >
                            New
                        </Button>
                    ) : null}
                    {tab !== 0 ? (
                        <Button
                            variant="contained"
                            startIcon={<LoopIcon />}
                            onClick={() => handleRenew()}
                            className={isRenew ? 'selected' : ''}
                            disabled={searchActionButton('renew')}
                        >
                            Renew
                        </Button>
                    ) : null}
                    {tab === 1 ? (
                        <Button
                            variant="contained"
                            startIcon={<OpenInNewIcon />}
                            onClick={() => handleUpgrade()}
                            className={isUpgrade ? 'selected' : ''}
                            disabled={searchActionButton('upgrade')}
                        >
                            Upgrade
                        </Button>
                    ) : null}
                    {searchBox ? (
                        <Box>
                            <Paper
                                component="form"
                                className={layout.searchRoot}
                                elevation={0}
                            >
                                <InputBase
                                    className={layout.searchRoot}
                                    placeholder={placeholderText()}
                                    inputProps={{
                                        'aria-label': 'search',
                                    }}
                                    autoComplete="off"
                                    autoFocus={true}
                                    onKeyPress={(e) => {
                                        e.key === 'Enter' &&
                                            searchFn(
                                                e,
                                                history,
                                                pathname,
                                                '',
                                                'renew',
                                            );
                                    }}
                                    value={props.searchData}
                                    onChange={(e) => updateSearch(e)}
                                />
                                <IconButton
                                    aria-label="create"
                                    onClick={(e) =>
                                        searchFn(
                                            e,
                                            history,
                                            pathname,
                                            '',
                                            'renew',
                                        )
                                    }
                                    className={layout.iconGo}
                                >
                                    <Icon fontSize="inherit">search</Icon>
                                </IconButton>
                            </Paper>
                        </Box>
                    ) : null}
                    {searchCount ? (
                        <Box style={{ marginTop: 24 }}>
                            <Paper
                                component="form"
                                className={layout.searchRoot}
                                elevation={0}
                            >
                                <InputBase
                                    className={layout.searchRoot}
                                    placeholder={placeholderText()}
                                    inputProps={{
                                        'aria-label': 'search',
                                    }}
                                    autoComplete="off"
                                    autoFocus={true}
                                    disabled={
                                        !hasPermission(
                                            props.permissionCodeData,
                                            props.permissionCode.searchCount,
                                            aclUrl(
                                                removeNewTemplateKeys(pathname),
                                            ),
                                        )
                                    }
                                    onKeyPress={(e) => {
                                        e.key === 'Enter' &&
                                            searchFn(
                                                e,
                                                history,
                                                pathname,
                                                '',
                                                'searchCount',
                                            );
                                    }}
                                    value={props.searchData}
                                    onChange={(e) => updateSearch(e)}
                                />
                                <IconButton
                                    aria-label="create"
                                    disabled={
                                        !hasPermission(
                                            props.permissionCodeData,
                                            props.permissionCode.searchCount,
                                            aclUrl(
                                                removeNewTemplateKeys(pathname),
                                            ),
                                        )
                                    }
                                    onClick={(e) =>
                                        searchFn(
                                            e,
                                            history,
                                            pathname,
                                            '',
                                            'searchCount',
                                        )
                                    }
                                    className={layout.iconGo}
                                >
                                    <Icon fontSize="inherit">search</Icon>
                                </IconButton>
                            </Paper>
                        </Box>
                    ) : null}
                    {searchSoftLock ? (
                        <Box style={{ marginTop: 24 }}>
                            <Paper
                                component="form"
                                className={layout.searchRoot}
                                elevation={0}
                            >
                                <InputBase
                                    className={layout.searchRoot}
                                    placeholder={placeholderText()}
                                    inputProps={{
                                        'aria-label': 'search',
                                    }}
                                    autoComplete="off"
                                    autoFocus={true}
                                    disabled={
                                        !hasPermission(
                                            props.permissionCodeData,
                                            props.permissionCode.softLock,
                                            aclUrl(
                                                removeNewTemplateKeys(pathname),
                                            ),
                                        )
                                    }
                                    onKeyPress={(e) => {
                                        e.key === 'Enter' &&
                                            searchFn(
                                                e,
                                                history,
                                                pathname,
                                                '',
                                                'softLock',
                                            );
                                    }}
                                    value={props.searchData}
                                    onChange={(e) => updateSearch(e)}
                                />
                                <IconButton
                                    aria-label="create"
                                    disabled={
                                        !hasPermission(
                                            props.permissionCodeData,
                                            props.permissionCode.softLock,
                                            aclUrl(
                                                removeNewTemplateKeys(pathname),
                                            ),
                                        )
                                    }
                                    onClick={(e) =>
                                        searchFn(
                                            e,
                                            history,
                                            pathname,
                                            '',
                                            'softLock',
                                        )
                                    }
                                    className={layout.iconGo}
                                >
                                    <Icon fontSize="inherit">search</Icon>
                                </IconButton>
                            </Paper>
                        </Box>
                    ) : null}
                </Grid>
            </Box>
        );
    };
    const renderData = () => {
        return (
            <Grid
                container
                spacing={3}
                className={`${common.mt50} ${common.mb10}`}
            >
                <Grid item xs={12} md={12}>
                    {rendeProduct()}
                </Grid>
                <Grid item xs={12} md={12}>
                    {hasPermission(
                        props.permissionCodeData,
                        props.permissionCode.walletList,
                        aclUrl(removeNewTemplateKeys(pathname)),
                    )
                        ? renderWallet()
                        : null}
                </Grid>
            </Grid>
        );
    };

    return (
        <React.Fragment>
            {hasPermission(
                props.permissionCodeData,
                props.permissionCode.globalSearch,
                aclUrl(removeNewTemplateKeys(pathname)),
            ) ? (
                <GlobalSearch
                    globalSearchData={props.globalSearchData}
                    globalSearchFn={props.globalSearchFn}
                    updateGlobalInputFn={props.updateGlobalInputFn}
                />
            ) : null}

            {renderData()}
            <Dialog
                open={props.transactionFormApproval}
                fullWidth={true}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => props.transactionFormPopup(false)}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {`You are adding ${props.transactionFormData.ac} Advance Credits for ${props.transactionFormData.total_amount}. This payment cannot be reversed. Do you want to continue?`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => props.transactionFormPopup(false)}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() =>
                            props.transactionSubmitFn(
                                props.transactionFormData,
                                props.walletFormData,
                                pathname,
                            )
                        }
                        color="primary"
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={props.approval}
                fullWidth={true}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => props.approvalPopup(false)}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {`${props.walletFormData.amount} ACs will be transferred to ${props.walletFormData.transferTo}. This transfer cannot be reversed. Do you want to
                            continue?`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => props.approvalPopup(false)}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() =>
                            props.walletTransferSubmit(
                                props.walletFormData,
                                pathname,
                            )
                        }
                        color="primary"
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={props.searchApproval.popup}
                fullWidth={true}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => closeSearchPopup()}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {props.searchApproval.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => closeSearchPopup()} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() =>
                            props.redirectSearchFn(
                                props.searchApproval.data,
                                props.searchApproval.page,
                                history,
                                pathname,
                            )
                        }
                        color="primary"
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={props.softlockPopup.popup}
                fullWidth={true}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => closeSoftlockPopup()}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {props.softlockPopup.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => closeSoftlockPopup()}
                        color="primary"
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
            {props.hardlockdata.pop_up_message ? (
                <Dialog
                    open={props.showhardlock}
                    fullWidth={true}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={() => closehardlockUpgradeFn()}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            {props.hardlockdata.pop_up_message}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => closehardlockUpgradeFn()}
                            color="primary"
                        >
                            No
                        </Button>
                        <Button
                            onClick={() =>
                                props.hardlockUpgradeFn(pathname, history)
                            }
                            color="primary"
                        >
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : null}
            {props.searchPopup.popup ? (
                <Dialog
                    open={props.searchPopup.popup}
                    fullWidth={true}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={() => closeSearchPopupFn()}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            {props.searchPopup.message}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => closeSearchPopupFn()}
                            color="primary"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() =>
                                props.searchDesktopRenewfn(pathname, history)
                            }
                            color="primary"
                        >
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : null}
            {props.searchUpgradePopup.popup ? (
                <Dialog
                    open={props.searchUpgradePopup.popup}
                    fullWidth={true}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={() => closeSearchUpgradePopupFn()}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            {props.searchUpgradePopup.message}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => closeSearchUpgradePopupFn()}
                            color="primary"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() =>
                                props.searchDesktopUpgradefn(pathname, history)
                            }
                            color="primary"
                        >
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : null}
            {props.searchSubPerPePopup.popup ? (
                <Dialog
                    open={props.searchSubPerPePopup.popup}
                    fullWidth={true}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={() => closesearchSubPerPePopupFn()}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            {props.searchSubPerPePopup.message}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => closesearchSubPerPePopupFn()}
                            color="primary"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() =>
                                props.searchDesktopSubPerPefn(history, pathname)
                            }
                            color="primary"
                        >
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : null}
        </React.Fragment>
    );
};

const mapStateToProps = (state) => {
    return {
        walletData: state.dashboardPartner.walletData,
        menu: state.themeNav.data,
        isTransactionScreen: state.dashboardPartner.isTransactionScreen,
        transactionScreen: state.dashboardPartner.transactionScreen,
        transactionFormData: state.dashboardPartner.transactionFormData,
        transactionFormApproval: state.dashboardPartner.transactionFormApproval,
        permissionCodeData: state.rootReducer.permissionCodeData,
        permissionCode: state.dashboardPartner.permissionCode,
        isFormScreen: state.dashboardPartner.isFormScreen,
        walletFormData: state.dashboardPartner.walletFormData,
        approval: state.dashboardPartner.approval,
        drawerToggle: state.dashboardPartner.drawerToggle,
        search: state.dashboardPartner.search,
        pList: state.dashboardPartner.pList,
        selectedItem: state.dashboardPartner.selectedItem,
        nextRequest: state.dashboardPartner.nextRequest,
        results: state.dashboardPartner.results,
        drawerData: state.dashboardPartner.drawerData,
        searchData: state.dashboardPartner.searchData,
        searchApproval: state.dashboardPartner.searchApproval,
        globalSearchData: state.dashboardPartner.globalSearchData,
        softlockPopup: state.dashboardPartner.softlockPopup,
        showhardlock: state.dashboardPartner.showhardlock,
        hardlockdata: state.dashboardPartner.hardlockdata,
        searchPopup: state.dashboardPartner.searchPopup,
        renewResponse: state.dashboardPartner.renewResponse,
        upgradeResponse: state.dashboardPartner.upgradeResponse,
        searchUpgradePopup: state.dashboardPartner.searchUpgradePopup,
        subPerPeResponse: state.dashboardPartner.subPerPeResponse,
        searchSubPerPePopup: state.dashboardPartner.searchSubPerPePopup,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        resetStateFn: () => {
            dispatch({
                type: 'RESET_DASHBOARD_PARTNER_REDUCER_STATE',
            });
        },
        getWalletDataFn: (pathname) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_GET_WALLET_DATA_API',
                pathname: pathname,
            });
        },
        resetWalletDataFn: () => {
            dispatch({
                type: 'DASHBOARD_PARTNER_WALLET_DATA_RESET',
            });
        },
        transactionScreen: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_TRANSACTION_SCREEN',
                value: val,
            });
        },
        transactionFormDataFn: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_TRANSACTION_FORM_DATA',
                value: val,
            });
        },
        transactionFormPopup: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_TRANSACTION_FORM_POPUP',
                value: val,
            });
        },
        resetTransactionFormDataFn: () => {
            dispatch({
                type: 'DASHBOARD_PARTNER_RESET_TRANSACTION_FORN_DATA_ACTION',
            });
        },
        updateAPIFn: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_TRANSACTION_FORM_API_ACTION',
                ac: val,
            });
        },
        transactionSubmitFn: (val, walletData, pathname) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_TRANSACTION_SUBMIT_API',
                value: val,
                walletData: walletData,
                pathname: pathname,
            });
        },
        transactionSussesFn: (val, pathname) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_TRANSACTION_SUSSES_API',
                value: val,
                pathname: pathname,
            });
        },
        transactionErrorFn: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_TRANSACTION_ERROR_API',
                value: val,
            });
        },
        getPermissionFn: (pathname) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_GET_PERMISSION_API',
                pathname: pathname,
            });
        },
        formScreen: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_FORM_SCREEN',
                value: val,
            });
        },
        walletFormDataFn: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_WALLET_FORM_DATA',
                value: val,
            });
        },
        approvalPopup: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_APPROVAL_POPUP',
                value: val,
            });
        },
        drawerToggleFn: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_DRAWER_OPEN_ACTION',
                value: val,
            });
        },

        getDrawerData: (pageName) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_DRAWER_DATA_API',
                page: pageName,
            });
        },
        updateSearchFn: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_DRAWER_SEARCH_DATA',
                value: val,
            });
        },
        setSelectedItem: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_DRAWER_LIST_SELECT_ITEM',
                value: val,
            });
        },
        resultsCount: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_DRAWER_LIST_RESULTS',
                value: val,
            });
        },
        walletTransferSubmit: (walletData, pathname) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_TRANSFER_AC_SUBMIT_API',
                walletData: walletData,
                pathname: pathname,
            });
        },
        resetWalletFormDataFn: () => {
            dispatch({
                type: 'DASHBOARD_PARTNER_RESET_WALLET_FORN_DATA_ACTION',
            });
        },
        updateInputFn: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_SEARCH_DATA',
                value: val,
            });
        },
        searchFn: (tab, eventType, history, pathname, path) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_SEARCH_ACTION',
                tab: tab,
                eventType: eventType,
                history: history,
                pathname: pathname,
                path: path,
            });
        },
        resetSearchPopupFn: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_SEARCH_APPROVAL',
                value: val,
            });
        },
        redirectSearchFn: (data, page, history, pathname) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_REDIRECT_SEARCH_ACTION',
                data: data,
                page: page,
                history: history,
                pathname: pathname,
            });
        },
        globalSearchFn: (history, pathname) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_GLOBAL_SEARCH_ACTION',
                history: history,
                pathname: pathname,
            });
        },
        // updateGlobalSearchFn: (val) => {
        //     dispatch({
        //         type: 'DASHBOARD_PARTNER_DRAWER_SEARCH_DATA',
        //         value: val,
        //     });
        // },
        updateGlobalInputFn: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_GLOBAL_SEARCH_DATA',
                value: val,
            });
        },
        resetSoftlockPopupFn: (val) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_SOFTLOCK_POPUP',
                value: val,
            });
        },
        hardlockUpgradeFn: (pathname, history) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_REDIRECT_UPGRADE',
                pathname,
                history,
            });
        },
        showhardlockfn: () => {
            dispatch({
                type: 'DASHBOARD_PARTNER_HARDLOCK_POPUP_FN',
            });
        },
        showSearchPopupfn: () => {
            dispatch({
                type: 'DASHBOARD_PARTNER_SEARCH_POPUP_FN',
            });
        },
        searchDesktopRenewfn: (pathname, history) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_SEARCH_RENEW_FN',
                pathname,
                history,
            });
        },
        searchUpgradePopupfn: () => {
            dispatch({
                type: 'DASHBOARD_PARTNER_SEARCH_UPGRADE_POPUP_FN',
            });
        },
        searchDesktopUpgradefn: (pathname, history) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_SEARCH_UPGRADE_FN',
                pathname,
                history,
            });
        },
        searchSubPerPePopupfn: () => {
            dispatch({
                type: 'DASHBOARD_PARTNER_SEARCH_SUB_PER_POPUP_FN',
            });
        },
        searchDesktopSubPerPefn: (history, pathname) => {
            dispatch({
                type: 'DASHBOARD_PARTNER_SEARCH_SUB_PER_FN',
                history: history,
                pathname: pathname,
            });
        },
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DashboardChannelPartners);
