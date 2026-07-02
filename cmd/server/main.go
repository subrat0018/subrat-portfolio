package main

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type Link struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}

type Experience struct {
	Company  string   `json:"company"`
	Role     string   `json:"role"`
	Period   string   `json:"period"`
	Location string   `json:"location"`
	Points   []string `json:"points"`
	Accent   string   `json:"accent"`
}

type Project struct {
	Name        string   `json:"name"`
	Period      string   `json:"period"`
	Stack       []string `json:"stack"`
	Description string   `json:"description"`
	Highlights  []string `json:"highlights"`
	Link        Link     `json:"link"`
}

type Achievement struct {
	Name   string `json:"name"`
	Metric string `json:"metric"`
	Detail string `json:"detail"`
	Link   Link   `json:"link"`
}

type Profile struct {
	Name         string        `json:"name"`
	Title        string        `json:"title"`
	Location     string        `json:"location"`
	Email        string        `json:"email"`
	Summary      string        `json:"summary"`
	Links        []Link        `json:"links"`
	Stats        []Link        `json:"stats"`
	Skills       []string      `json:"skills"`
	Languages    []string      `json:"languages"`
	Education    []Link        `json:"education"`
	Experience   []Experience  `json:"experience"`
	Projects     []Project     `json:"projects"`
	Achievements []Achievement `json:"achievements"`
}

type ContactMessage struct {
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"createdAt"`
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", withCORS(handleHealth))
	mux.HandleFunc("/api/profile", withCORS(handleProfile))
	mux.HandleFunc("/api/contact", withCORS(handleContact))
	mux.HandleFunc("/api/messages", withCORS(handleMessages))

	staticDir := getenv("STATIC_DIR", "frontend/dist")
	mux.Handle("/", spaHandler(staticDir))

	port := getenv("PORT", "8080")
	log.Printf("Subrat portfolio server listening on http://localhost:%s", port)
	log.Printf("Serving static files from %s", staticDir)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func handleProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}
	writeJSON(w, http.StatusOK, profileData())
}

func handleContact(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		methodNotAllowed(w)
		return
	}

	var msg ContactMessage
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON body")
		return
	}

	msg.Name = strings.TrimSpace(msg.Name)
	msg.Email = strings.TrimSpace(msg.Email)
	msg.Message = strings.TrimSpace(msg.Message)
	msg.CreatedAt = time.Now().UTC()

	if err := validateMessage(msg); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := appendMessage(msg); err != nil {
		log.Printf("contact write failed: %v", err)
		writeError(w, http.StatusInternalServerError, "Could not save message")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{
		"status":  "received",
		"message": "Thanks. I will get back to you soon.",
	})
}

func handleMessages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		methodNotAllowed(w)
		return
	}

	file, err := os.Open(messagesPath())
	if errors.Is(err, os.ErrNotExist) {
		writeJSON(w, http.StatusOK, []ContactMessage{})
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Could not read messages")
		return
	}
	defer file.Close()

	var messages []ContactMessage
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		var msg ContactMessage
		if err := json.Unmarshal(scanner.Bytes(), &msg); err == nil {
			messages = append(messages, msg)
		}
	}
	if err := scanner.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "Could not parse messages")
		return
	}

	writeJSON(w, http.StatusOK, messages)
}

func validateMessage(msg ContactMessage) error {
	if len(msg.Name) < 2 {
		return errors.New("Please enter your name")
	}
	if !strings.Contains(msg.Email, "@") || !strings.Contains(msg.Email, ".") {
		return errors.New("Please enter a valid email")
	}
	if len(msg.Message) < 12 {
		return errors.New("Please write a slightly longer message")
	}
	return nil
}

func appendMessage(msg ContactMessage) error {
	path := messagesPath()
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}

	file, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0600)
	if err != nil {
		return err
	}
	defer file.Close()

	line, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	_, err = file.Write(append(line, '\n'))
	return err
}

func messagesPath() string {
	return getenv("MESSAGES_FILE", "data/contact-messages.jsonl")
}

func profileData() Profile {
	return Profile{
		Name:     "Subrat Chandra Naha",
		Title:    "Backend Software Engineer",
		Location: "Cuttack, Odisha",
		Email:    "subratchandra2003@gmail.com",
		Summary:  "I build reliable backend and Applied AI systems where latency, correctness, quality signals, and business impact all matter. Most recently I have worked on AI-adjacent evaluation workflows, referral intelligence, payments-scale profit sharing, compression, caching, and observability across high-traffic products.",
		Links: []Link{
			{Label: "LinkedIn", URL: "https://www.linkedin.com/in/subrat-chandra-naha-3a5890202/"},
			{Label: "GitHub", URL: "https://github.com/subrat0018"},
			{Label: "Email", URL: "mailto:subratchandra2003@gmail.com"},
			{Label: "Resume", URL: "/SubratChandraNahaResume.pdf"},
		},
		Stats: []Link{
			{Label: "$400K+/week", URL: "Referral profit-sharing distribution"},
			{Label: "50% lower", URL: "Dashboard latency through async Snowflake calculations"},
			{Label: "6x lower", URL: "Redis cache cost after Protobuf and Snappy"},
			{Label: "2446", URL: "LeetCode max rating, Guardian"},
		},
		Skills: []string{
			"Go", "C++", "Python", "JavaScript", "MySQL", "Redis", "Kafka", "DynamoDB",
			"MongoDB", "gRPC", "Protobuf", "Docker", "Distributed Systems", "WebSocket",
			"Applied AI", "AI Evaluation", "Zstandard", "Snappy", "Snowflake", "Solidity",
		},
		Languages: []string{"Go", "C++", "Python", "JavaScript", "HTML/CSS", "Solidity"},
		Education: []Link{
			{Label: "B.Tech in Computer Science and Engineering, NIT Rourkela", URL: "CGPA 9.06, 2020 - 2024"},
			{Label: "Adyant Higher Secondary School, Bhubaneswar", URL: "93.33%, ranked 8th in Odisha board exams"},
		},
		Experience: []Experience{
			{
				Company:  "Mercor",
				Role:     "SDE | Backend & Applied AI",
				Period:   "Oct 2025 - Present",
				Location: "Remote",
				Accent:   "AI Systems",
				Points: []string{
					"Building Applied AI workflows around expert quality signals, evaluation loops, and intelligence features used to identify stronger talent.",
					"Led a scalable quality-driven referral profit-sharing system distributing more than $400K/week and lifting new users by 10%.",
					"Removed service coupling and introduced asynchronous Snowflake dashboard calculations, lowering dashboard latency by 50% and saving $300/month.",
					"Built referral intelligence features including Reputation Score and Boost Email campaigns to move incentives toward quality-first acquisition.",
					"Designed an internal URL shortener used across Mercor with improved reliability, observability, and control.",
				},
			},
			{
				Company:  "Zomato",
				Role:     "SDE | Backend",
				Period:   "Sept 2024 - Oct 2025",
				Location: "Gurugram",
				Accent:   "Impact",
				Points: []string{
					"Shipped Quick Delivery, Gold surge fee, Tip Zomato, Crazy Drops, personalized carts, dynamic pricing, and other high-impact product work.",
					"Reduced Redis cache costs 6x using Protobuf serialization and Snappy compression.",
					"Reduced Kafka payload storage costs by 20% after evaluating and integrating Zstandard compression.",
					"Removed a dependent RPC through local caching and polling, cutting latency by 30ms and reducing an external service's container count by 25%.",
				},
			},
			{
				Company:  "American Express",
				Role:     "SDE Intern",
				Period:   "May 2023 - July 2023",
				Location: "Bengaluru",
				Accent:   "Optimization",
				Points: []string{
					"Optimized parser runtime from 7 hours to 23 minutes.",
					"Improved observability and alerting with Slack and email notifications plus stakeholder escalation.",
					"Investigated and fixed log forwarding bugs that could cause data loss during analysis.",
				},
			},
			{
				Company:  "Printerverse",
				Role:     "Fullstack Intern",
				Period:   "Feb 2023 - April 2023",
				Location: "Remote",
				Accent:   "Product",
				Points: []string{
					"Designed and integrated file-system features including upload, delete, copy, move, and context menus.",
					"Resolved 20+ frontend bugs to improve responsiveness and stability.",
				},
			},
		},
		Projects: []Project{
			{
				Name:        "Typing Titans",
				Period:      "July 2023",
				Stack:       []string{"Go", "WebSocket", "MongoDB", "React", "Tailwind CSS"},
				Description: "A speed-typing game with solo practice and real-time multiplayer competition.",
				Highlights: []string{
					"Implemented live progress, typing speed visualization, and multiplayer race flows.",
					"Built the backend with Go, WebSocket transport, and MongoDB persistence.",
				},
				Link: Link{Label: "GitHub", URL: "https://github.com/subrat0018/Typing-Titans"},
			},
			{
				Name:        "SnapSwap",
				Period:      "EthIndia 2023",
				Stack:       []string{"Solidity", "Web3", "Product Engineering"},
				Description: "An EthIndia-winning application that secured a $2000 prize.",
				Highlights: []string{
					"Built during EthIndia 2023 and selected as a winner.",
					"Focused on fast product execution across blockchain workflows.",
				},
				Link: Link{Label: "Project", URL: "https://ethglobal.com/showcase/snapswap-k6dx7"},
			},
		},
		Achievements: []Achievement{
			{Name: "CodeChef", Metric: "2123 | 5 star", Detail: "Top 300 in India and top 750 worldwide.", Link: Link{Label: "Profile", URL: "https://www.codechef.com/users/subrat0018/"}},
			{Name: "LeetCode", Metric: "2446 | Guardian", Detail: "Top 0.35 percentile among 5.5L participants.", Link: Link{Label: "Profile", URL: "https://leetcode.com/subrat0018/"}},
			{Name: "Codeforces", Metric: "1888 | Expert", Detail: "Top 500 in India.", Link: Link{Label: "Profile", URL: "https://codeforces.com/profile/subrat0018"}},
			{Name: "AtCoder", Metric: "1620", Detail: "Top 1 percentile among 1.53L participants.", Link: Link{Label: "Profile", URL: "https://atcoder.jp/users/subrat18"}},
			{Name: "ICPC Kanpur Regionals 2023", Metric: "Rank 23", Detail: "Regional competitive programming result.", Link: Link{Label: "Certificate", URL: "https://drive.google.com/file/d/1h98ZvD8WsEp9Al4KSccUFWPnYhfnvxl7/view?usp=sharing"}},
			{Name: "Oppo Inspiration Cup", Metric: "Finalist", Detail: "Top 20 among 9k+ participants.", Link: Link{Label: "Certificate", URL: "https://drive.google.com/file/d/1C1DqoebuyviGtSh4RMoU9yH6sDDxi27P/view?usp=share_link"}},
		},
	}
}

func spaHandler(staticDir string) http.Handler {
	fileServer := http.FileServer(http.Dir(staticDir))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join(staticDir, filepath.Clean(r.URL.Path))
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			fileServer.ServeHTTP(w, r)
			return
		}

		index := filepath.Join(staticDir, "index.html")
		if _, err := os.Stat(index); err != nil {
			w.Header().Set("Content-Type", "text/plain; charset=utf-8")
			w.WriteHeader(http.StatusNotFound)
			fmt.Fprintf(w, "Frontend build not found. Run `pnpm --dir frontend build` first.\n")
			return
		}
		http.ServeFile(w, r, index)
	})
}

func withCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		next(w, r)
	}
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("json encode failed: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func methodNotAllowed(w http.ResponseWriter) {
	writeError(w, http.StatusMethodNotAllowed, "Method not allowed")
}

func getenv(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}
