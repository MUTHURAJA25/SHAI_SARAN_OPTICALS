(() => {
    const { useState, useEffect, useContext, createContext } = React;
    const {
      BrowserRouter,
      Routes,
      Route,
      Link,
      useNavigate,
      useParams,
      useLocation,
    } = ReactRouterDOM;
  
    const API_BASE = window.API_BASE_URL || "http://localhost:5000";
  
    const CartContext = createContext();
  
    function CartProvider({ children }) {
      const [items, setItems] = useState(() => {
        try {
          const stored = localStorage.getItem("optical_cart");
          return stored ? JSON.parse(stored) : [];
        } catch {
          return [];
        }
      });
  
      useEffect(() => {
        localStorage.setItem("optical_cart", JSON.stringify(items));
      }, [items]);
  
      const addToCart = (product, qty = 1) => {
        setItems((prev) => {
          const existing = prev.find((p) => p.productId === product._id);
          if (existing) {
            return prev.map((p) =>
              p.productId === product._id
                ? { ...p, quantity: p.quantity + qty }
                : p
            );
          }
          return [
            ...prev,
            {
              productId: product._id,
              name: product.name,
              type: product.type,
              price: product.price,
              quantity: qty,
            },
          ];
        });
      };
  
      const updateQuantity = (productId, quantity) => {
        setItems((prev) =>
          prev
            .map((item) =>
              item.productId === productId ? { ...item, quantity } : item
            )
            .filter((item) => item.quantity > 0)
        );
      };
  
      const removeItem = (productId) => {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
      };
  
      const clearCart = () => setItems([]);
  
      const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
      const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  
      return React.createElement(
        CartContext.Provider,
        {
          value: {
            items,
            addToCart,
            updateQuantity,
            removeItem,
            clearCart,
            totalItems,
            totalAmount,
          },
        },
        children
      );
    }
  
    function useCart() {
      return useContext(CartContext);
    }
  
    function useQuery() {
      const { search } = useLocation();
      return React.useMemo(() => new URLSearchParams(search), [search]);
    }
  
    function Navbar() {
      const { totalItems } = useCart();
      return React.createElement(
        "nav",
        { className: "nav" },
        React.createElement(
          "div",
          { className: "nav-left" },
          React.createElement("div", { className: "brand-mark" }, "👓"),
          React.createElement(
            "div",
            null,
            React.createElement(
              "div",
              { className: "brand-name" },
              "Your Optical Studio"
            ),
            React.createElement(
              "div",
              { className: "brand-sub" },
              "Frames, lenses & contact lenses."
            )
          )
        ),
        React.createElement(
          "div",
          { className: "nav-links" },
          React.createElement(
            Link,
            { className: "nav-link", to: "/" },
            "Home"
          ),
          React.createElement(
            Link,
            { className: "nav-link", to: "/frames" },
            "Frames"
          ),
          React.createElement(
            Link,
            { className: "nav-link", to: "/lenses" },
            "Lenses"
          ),
          React.createElement(
            Link,
            { className: "nav-link", to: "/contact-lenses" },
            "Contact Lenses"
          ),
          React.createElement(
            Link,
            { className: "nav-link nav-cart", to: "/cart" },
            "Cart",
            totalItems > 0 &&
              React.createElement(
                "span",
                { className: "nav-cart-count" },
                totalItems
              )
          )
        )
      );
    }
  
    function HomePage() {
      const navigate = useNavigate();
  
      return React.createElement(
        "div",
        { className: "page" },
        React.createElement(
          "section",
          { className: "hero" },
          React.createElement(
            "div",
            null,
            React.createElement(
              "h1",
              { className: "hero-heading" },
              "See better. Look sharper."
            ),
            React.createElement(
              "p",
              { className: "hero-sub" },
              "Shop curated frames, prescription lenses and comfortable daily contact lenses from your trusted optical shop."
            ),
            React.createElement(
              "div",
              { className: "hero-actions" },
              React.createElement(
                "button",
                {
                  className: "btn btn-primary",
                  onClick: () => navigate("/frames"),
                },
                "Browse frames"
              ),
              React.createElement(
                "button",
                {
                  className: "btn btn-outline",
                  onClick: () => navigate("/contact-lenses"),
                },
                "Shop contact lenses"
              )
            )
          ),
          React.createElement(
            "div",
            { className: "hero-card" },
            React.createElement(
              "div",
              { className: "hero-card-title" },
              "In-store expertise, online convenience"
            ),
            React.createElement(
              "ul",
              { className: "hero-card-list" },
              React.createElement(
                "li",
                null,
                "✓ Top brands for every face shape"
              ),
              React.createElement(
                "li",
                null,
                "✓ Prescription lenses with your power"
              ),
              React.createElement(
                "li",
                null,
                "✓ Secure online payment via Razorpay"
              ),
              React.createElement(
                "li",
                null,
                "✓ Visit shop for eye test & fitting"
              )
            )
          )
        ),
        React.createElement(
          "section",
          null,
          React.createElement(
            "h2",
            { className: "section-title" },
            "Shop by category"
          ),
          React.createElement(
            "div",
            { className: "category-grid" },
            React.createElement(
              "div",
              { className: "category-card" },
              React.createElement(
                "div",
                { className: "category-chip" },
                "Frames"
              ),
              React.createElement(
                "div",
                { className: "category-title" },
                "Eyeglass frames"
              ),
              React.createElement(
                "div",
                { className: "category-sub" },
                "Lightweight, stylish frames for daily comfort."
              ),
              React.createElement(
                "button",
                {
                  className: "btn btn-outline",
                  onClick: () => navigate("/frames"),
                },
                "View frames"
              )
            ),
            React.createElement(
              "div",
              { className: "category-card" },
              React.createElement(
                "div",
                { className: "category-chip" },
                "Lenses"
              ),
              React.createElement(
                "div",
                { className: "category-title" },
                "Prescription lenses"
              ),
              React.createElement(
                "div",
                { className: "category-sub" },
                "Single vision, bifocal and premium coatings."
              ),
              React.createElement(
                "button",
                {
                  className: "btn btn-outline",
                  onClick: () => navigate("/lenses"),
                },
                "View lenses"
              )
            ),
            React.createElement(
              "div",
              { className: "category-card" },
              React.createElement(
                "div",
                { className: "category-chip" },
                "Contact"
              ),
              React.createElement(
                "div",
                { className: "category-title" },
                "Contact lenses"
              ),
              React.createElement(
                "div",
                { className: "category-sub" },
                "Daily, monthly and color lenses from trusted brands."
              ),
              React.createElement(
                "button",
                {
                  className: "btn btn-outline",
                  onClick: () => navigate("/contact-lenses"),
                },
                "View contact lenses"
              )
            )
          )
        ),
        React.createElement(
          "section",
          null,
          React.createElement(
            "h2",
            { className: "section-title" },
            "Visit or contact us"
          ),
          React.createElement(
            "p",
            { style: { fontSize: "0.9rem", color: "#4b5563", marginBottom: 4 } },
            "Add your shop address and contact details here."
          ),
          React.createElement(
            "p",
            { style: { fontSize: "0.85rem", color: "#6b7280" } },
            "For power confirmation, fitting and any questions, customers can WhatsApp or call your shop."
          )
        )
      );
    }
  
    function ProductListPage({ type }) {
      const [products, setProducts] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState("");
      const [brand, setBrand] = useState("");
      const [search, setSearch] = useState("");
      const navigate = useNavigate();
  
      useEffect(() => {
        const controller = new AbortController();
        async function load() {
          setLoading(true);
          setError("");
          try {
            const params = new URLSearchParams();
            params.set("type", type);
            if (brand) params.set("brand", brand);
            if (search) params.set("search", search);
            const res = await fetch(`${API_BASE}/api/products?` + params, {
              signal: controller.signal,
            });
            if (!res.ok) throw new Error("Failed to load products");
            const data = await res.json();
            setProducts(data);
          } catch (e) {
            if (e.name !== "AbortError") setError(e.message);
          } finally {
            setLoading(false);
          }
        }
        load();
        return () => controller.abort();
      }, [type, brand, search]);
  
      const titleMap = {
        frame: "Frames",
        lens: "Lenses",
        "contact-lens": "Contact Lenses",
      };
  
      return React.createElement(
        "div",
        { className: "page" },
        React.createElement(
          "h1",
          { className: "section-title" },
          titleMap[type] || "Products"
        ),
        React.createElement(
          "div",
          { className: "filters" },
          React.createElement("input", {
            className: "input",
            placeholder: "Search",
            value: search,
            onChange: (e) => setSearch(e.target.value),
          }),
          React.createElement("input", {
            className: "input",
            placeholder: "Brand",
            value: brand,
            onChange: (e) => setBrand(e.target.value),
          })
        ),
        loading &&
          React.createElement(
            "div",
            { className: "empty-state" },
            "Loading products..."
          ),
        error &&
          React.createElement(
            "div",
            { className: "empty-state" },
            "Error: ",
            error
          ),
        !loading &&
          !error &&
          products.length === 0 &&
          React.createElement(
            "div",
            { className: "empty-state" },
            "No products found. Add some from the backend."
          ),
        !loading &&
          !error &&
          products.length > 0 &&
          React.createElement(
            "div",
            { className: "product-grid" },
            products.map((p) =>
              React.createElement(
                "div",
                { key: p._id, className: "product-card" },
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "div",
                    { className: "product-name" },
                    p.name
                  ),
                  p.brand &&
                    React.createElement(
                      "div",
                      { className: "product-brand" },
                      p.brand
                    ),
                  React.createElement(
                    "div",
                    { className: "product-price" },
                    "₹ ",
                    p.price
                  ),
                  React.createElement(
                    "div",
                    { className: "product-type" },
                    p.type
                  )
                ),
                React.createElement(
                  "div",
                  { className: "product-actions" },
                  React.createElement(
                    "button",
                    {
                      className: "btn btn-outline",
                      onClick: () => navigate(`/product/${p._id}`),
                    },
                    "View"
                  )
                )
              )
            )
          )
      );
    }
  
    function ProductDetailPage() {
      const { id } = useParams();
      const [product, setProduct] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState("");
      const { addToCart } = useCart();
  
      useEffect(() => {
        async function load() {
          setLoading(true);
          setError("");
          try {
            const res = await fetch(`${API_BASE}/api/products/${id}`);
            if (!res.ok) throw new Error("Failed to load product");
            const data = await res.json();
            setProduct(data);
          } catch (e) {
            setError(e.message);
          } finally {
            setLoading(false);
          }
        }
        load();
      }, [id]);
  
      if (loading) {
        return React.createElement(
          "div",
          { className: "page" },
          React.createElement(
            "div",
            { className: "empty-state" },
            "Loading product..."
          )
        );
      }
  
      if (error || !product) {
        return React.createElement(
          "div",
          { className: "page" },
          React.createElement(
            "div",
            { className: "empty-state" },
            "Product not found."
          )
        );
      }
  
      return React.createElement(
        "div",
        { className: "page" },
        React.createElement(
          "h1",
          { className: "section-title" },
          product.name
        ),
        React.createElement(
          "p",
          { className: "product-brand" },
          product.brand
        ),
        React.createElement(
          "p",
          { style: { marginTop: 8, marginBottom: 8 } },
          "₹ ",
          product.price
        ),
        React.createElement(
          "p",
          {
            style: {
              fontSize: "0.85rem",
              color: "#4b5563",
              marginBottom: 12,
            },
          },
          product.description
        ),
        React.createElement(
          "p",
          { style: { fontSize: "0.8rem", color: "#6b7280", marginBottom: 16 } },
          "For prescription power and lens options, we will confirm with you on call/WhatsApp after you place the order."
        ),
        React.createElement(
          "button",
          {
            className: "btn btn-primary",
            onClick: () => addToCart(product, 1),
          },
          "Add to cart"
        )
      );
    }
  
    function CartPage() {
      const { items, updateQuantity, removeItem, totalAmount } = useCart();
      const navigate = useNavigate();
  
      if (items.length === 0) {
        return React.createElement(
          "div",
          { className: "page" },
          React.createElement(
            "div",
            { className: "empty-state" },
            "Your cart is empty."
          )
        );
      }
  
      return React.createElement(
        "div",
        { className: "page" },
        React.createElement("h1", { className: "section-title" }, "Cart"),
        React.createElement(
          "table",
          { className: "cart-table" },
          React.createElement(
            "thead",
            null,
            React.createElement(
              "tr",
              null,
              React.createElement("th", null, "Item"),
              React.createElement("th", null, "Type"),
              React.createElement("th", null, "Price"),
              React.createElement("th", null, "Qty"),
              React.createElement("th", null, "Subtotal"),
              React.createElement("th", null, "")
            )
          ),
          React.createElement(
            "tbody",
            null,
            items.map((item) =>
              React.createElement(
                "tr",
                { key: item.productId },
                React.createElement("td", null, item.name),
                React.createElement("td", null, item.type),
                React.createElement("td", null, "₹ ", item.price),
                React.createElement(
                  "td",
                  null,
                  React.createElement("input", {
                    type: "number",
                    min: 1,
                    value: item.quantity,
                    className: "input",
                    style: { width: 60 },
                    onChange: (e) =>
                      updateQuantity(
                        item.productId,
                        Number(e.target.value || 1)
                      ),
                  })
                ),
                React.createElement(
                  "td",
                  null,
                  "₹ ",
                  item.price * item.quantity
                ),
                React.createElement(
                  "td",
                  null,
                  React.createElement(
                    "button",
                    {
                      className: "btn btn-outline",
                      onClick: () => removeItem(item.productId),
                    },
                    "Remove"
                  )
                )
              )
            )
          )
        ),
        React.createElement(
          "div",
          { className: "cart-summary" },
          React.createElement(
            "div",
            null,
            React.createElement(
              "div",
              { style: { fontWeight: 600 } },
              "Total: ₹ ",
              totalAmount
            ),
            React.createElement(
              "div",
              { style: { fontSize: "0.8rem", color: "#6b7280" } },
              "Taxes & shipping can be confirmed by shop."
            )
          ),
          React.createElement(
            "button",
            {
              className: "btn btn-primary",
              onClick: () => navigate("/checkout"),
            },
            "Proceed to checkout"
          )
        )
      );
    }
  
    function CheckoutPage() {
      const { items, totalAmount, clearCart } = useCart();
      const [customer, setCustomer] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
      });
      const [notes, setNotes] = useState("");
      const [loading, setLoading] = useState(false);
      const [message, setMessage] = useState("");
      const navigate = useNavigate();
  
      if (items.length === 0) {
        return React.createElement(
          "div",
          { className: "page" },
          React.createElement(
            "div",
            { className: "empty-state" },
            "Your cart is empty."
          )
        );
      }
  
      const handleInput = (field, value) => {
        setCustomer((prev) => ({ ...prev, [field]: value }));
      };
  
      const startPayment = async () => {
        setLoading(true);
        setMessage("");
        try {
          const res = await fetch(`${API_BASE}/api/payment/create-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cartItems: items.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
              })),
              customer,
              notes,
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Failed to start payment");
          }
          const data = await res.json();
  
          const options = {
            key: data.razorpayKeyId,
            amount: Math.round(data.amount * 100),
            currency: data.currency || "INR",
            name: "Your Optical Shop",
            description: "Order payment",
            order_id: data.razorpayOrderId,
            prefill: {
              name: customer.name,
              email: customer.email,
              contact: customer.phone,
            },
            handler: async function (response) {
              try {
                const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    orderId: data.orderId,
                  }),
                });
                const verifyData = await verifyRes.json();
                if (!verifyRes.ok || !verifyData.success) {
                  throw new Error(verifyData.message || "Payment not verified");
                }
                setMessage("Payment successful! We will contact you shortly.");
                clearCart();
                setTimeout(() => navigate("/"), 2500);
              } catch (e) {
                setMessage(e.message || "Payment verification failed.");
              }
            },
            theme: {
              color: "#2563eb",
            },
          };
  
          const rzp = new Razorpay(options);
          rzp.open();
        } catch (e) {
          setMessage(e.message);
        } finally {
          setLoading(false);
        }
      };
  
      return React.createElement(
        "div",
        { className: "page" },
        React.createElement("h1", { className: "section-title" }, "Checkout"),
        React.createElement(
          "p",
          { style: { fontSize: "0.8rem", color: "#6b7280", marginBottom: 12 } },
          "Secure payment powered by Razorpay. We will confirm your power and any lens customisation after the order."
        ),
        React.createElement(
          "div",
          { className: "checkout-grid" },
          React.createElement(
            "div",
            { className: "card" },
            React.createElement(
              "h2",
              { className: "section-title", style: { marginTop: 0 } },
              "Your details"
            ),
            React.createElement(
              "div",
              { className: "field" },
              React.createElement("label", null, "Name*"),
              React.createElement("input", {
                className: "input",
                value: customer.name,
                onChange: (e) => handleInput("name", e.target.value),
              })
            ),
            React.createElement(
              "div",
              { className: "field" },
              React.createElement("label", null, "Mobile*"),
              React.createElement("input", {
                className: "input",
                value: customer.phone,
                onChange: (e) => handleInput("phone", e.target.value),
              })
            ),
            React.createElement(
              "div",
              { className: "field" },
              React.createElement("label", null, "Email"),
              React.createElement("input", {
                className: "input",
                value: customer.email,
                onChange: (e) => handleInput("email", e.target.value),
              })
            ),
            React.createElement(
              "div",
              { className: "field" },
              React.createElement(
                "label",
                null,
                "Delivery address (or mention pickup in shop)"
              ),
              React.createElement("textarea", {
                className: "textarea",
                value: customer.address,
                onChange: (e) => handleInput("address", e.target.value),
              })
            ),
            React.createElement(
              "div",
              { className: "field" },
              React.createElement(
                "label",
                null,
                "Prescription / power notes (optional)"
              ),
              React.createElement("textarea", {
                className: "textarea",
                value: notes,
                onChange: (e) => setNotes(e.target.value),
              })
            )
          ),
          React.createElement(
            "div",
            { className: "card" },
            React.createElement(
              "h2",
              { className: "section-title", style: { marginTop: 0 } },
              "Order summary"
            ),
            React.createElement(
              "ul",
              { style: { listStyle: "none", marginTop: 8, marginBottom: 8 } },
              items.map((i) =>
                React.createElement(
                  "li",
                  {
                    key: i.productId,
                    style: {
                      fontSize: "0.85rem",
                      marginBottom: 4,
                      display: "flex",
                      justifyContent: "space-between",
                    },
                  },
                  React.createElement(
                    "span",
                    null,
                    i.name,
                    " × ",
                    i.quantity
                  ),
                  React.createElement(
                    "span",
                    null,
                    "₹ ",
                    i.price * i.quantity
                  )
                )
              )
            ),
            React.createElement(
              "div",
              {
                style: {
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 600,
                },
              },
              React.createElement("span", null, "Total"),
              React.createElement("span", null, "₹ ", totalAmount)
            ),
            React.createElement(
              "p",
              {
                style: {
                  fontSize: "0.8rem",
                  color: "#6b7280",
                  marginTop: 6,
                  marginBottom: 12,
                },
              },
              "Shop can confirm final amount including any lens upgrade or taxes."
            ),
            React.createElement(
              "button",
              {
                className: "btn btn-primary",
                disabled: loading || !customer.name || !customer.phone,
                onClick: startPayment,
              },
              loading ? "Starting payment..." : "Pay securely with Razorpay"
            ),
            message &&
              React.createElement(
                "p",
                {
                  style: {
                    marginTop: 10,
                    fontSize: "0.8rem",
                    color: "#4b5563",
                  },
                },
                message
              )
          )
        )
      );
    }
  
    function AppShell() {
      return React.createElement(
        "div",
        { className: "app-shell" },
        React.createElement(Navbar, null),
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: "/",
            element: React.createElement(HomePage, null),
          }),
          React.createElement(Route, {
            path: "/frames",
            element: React.createElement(ProductListPage, { type: "frame" }),
          }),
          React.createElement(Route, {
            path: "/lenses",
            element: React.createElement(ProductListPage, { type: "lens" }),
          }),
          React.createElement(Route, {
            path: "/contact-lenses",
            element: React.createElement(ProductListPage, {
              type: "contact-lens",
            }),
          }),
          React.createElement(Route, {
            path: "/product/:id",
            element: React.createElement(ProductDetailPage, null),
          }),
          React.createElement(Route, {
            path: "/cart",
            element: React.createElement(CartPage, null),
          }),
          React.createElement(Route, {
            path: "/checkout",
            element: React.createElement(CheckoutPage, null),
          })
        ),
        React.createElement(
          "footer",
          { className: "footer" },
          "Add shop name, address, contact number and WhatsApp here."
        )
      );
    }
  
    function Root() {
      return React.createElement(
        BrowserRouter,
        null,
        React.createElement(
          CartProvider,
          null,
          React.createElement(AppShell, null)
        )
      );
    }
  
    const rootElement = document.getElementById("root");
    const root = ReactDOM.createRoot(rootElement);
    root.render(React.createElement(Root, null));
  })();
  
  